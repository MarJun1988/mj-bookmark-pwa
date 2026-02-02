import { prisma } from '../../lib/prisma.js'
import type { Context } from '../../types/types.js'
import { GraphQLError } from 'graphql/index.js'
import { signAccessToken, signRefreshToken } from '../../auth/tokens.js'
import bcrypt from 'bcrypt'
import crypto from 'node:crypto'
import {
  getUserDisplayName,
  hashPassword,
  isValidEmail,
} from '../../utils/utils.js'
import { Prisma } from '@prisma/client/extension'
import { verifyEmailTemplate } from '../../mail/templates/verifyEmail.js'
import { sendMail } from '../../mail/sendMail.js'
import { resetPasswordTemplate } from '../../mail/templates/resetPassword.js'
import { welcomeTemplate } from '../../mail/templates/welcome.js'
import { passwordError } from '../user/types.js'

export const Mutation = {
  bootstrapAdmin: async (
    _: unknown,
    args: {
      email: string
      password: string
      lastName?: string
      firstName?: string
      displayName?: string
    },
    ctx: Context,
  ) => {
    // 🔒 TRANSACTION = race-safe
    return ctx.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const count = await tx.user.count()

      if (count > 0) {
        throw new GraphQLError('Bootstrap already completed', {
          extensions: { code: 'FORBIDDEN' },
        })
      }

      if (!isValidEmail(args.email)) {
        throw new GraphQLError('Invalid email address', {
          extensions: { code: 'BAD_USER_INPUT' },
        })
      }

      const user = await tx.user.create({
        data: {
          email: args.email.trim().toLowerCase(),
          password: await hashPassword(args.password),
          lastName: args.lastName ?? null,
          firstName: args.firstName ?? null,
          displayName: args.displayName ?? null,
          role: 'ADMIN',
        },
      })

      const accessToken = signAccessToken(user)
      const { token: refreshToken, hash, expiresAt } = signRefreshToken()

      await tx.refreshToken.create({
        data: {
          tokenHash: hash,
          userId: user.id,
          expiresAt,
        },
      })

      return {
        accessToken,
        refreshToken,
        user,
      }
    })
  },

  login: async (
    _: unknown,
    { email, password }: { email: string; password: string },
    ctx: Context,
  ) => {
    const user = await prisma.user.findUnique({ where: { email } })

    const invalidCredentialsError = new GraphQLError('Invalid credentials', {
      extensions: {
        code: 'AUTH_INVALID_CREDENTIALS',
      },
    })

    if (!user) {
      // 🔒 intern kannst du loggen
      // logger.warn('Login failed: user not found', { email })
      throw invalidCredentialsError
    }

    const ok = await bcrypt.compare(password, user.password)
    if (!ok) {
      // logger.warn('Login failed: invalid password', { userId: user.id })
      throw invalidCredentialsError
    }

    if (!user.emailVerified) {
      throw new GraphQLError(
        'Please verify your email address before logging in.',
        {
          extensions: {
            code: 'AUTH_NOT_VERIFIED',
          },
        },
      )
    }

    const accessToken = signAccessToken(user)
    const { token: refreshToken, hash, expiresAt } = signRefreshToken()

    await prisma.refreshToken.create({
      data: {
        tokenHash: hash,
        userId: user.id,
        expiresAt,
      },
    })

    if (!ctx.res) {
      throw new GraphQLError('HTTP response not available', {
        extensions: { code: 'INTERNAL_SERVER_ERROR' },
      })
    }

    const isProd = process.env.NODE_ENV === 'production'

    ctx.res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: isProd,
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 30, // 30 Tage
    })

    return {
      accessToken,
      refreshToken,
      user,
    }
  },

  logout: async (_: unknown, __: unknown, ctx: Context): Promise<boolean> => {
    if (!ctx.req || !ctx.res) {
      throw new GraphQLError('HTTP context missing', {
        extensions: { code: 'INTERNAL_SERVER_ERROR' },
      })
    }

    const token = ctx.req.cookies?.refreshToken

    if (token) {
      const hash = crypto.createHash('sha256').update(token).digest('hex')

      // 🔥 Refresh Token in DB löschen
      await ctx.prisma.refreshToken.deleteMany({
        where: { tokenHash: hash },
      })
    }

    // 🍪 Cookie löschen
    ctx.res.clearCookie('refreshToken', {
      path: '/',
    })

    return true
  },

  refreshToken: async (_: unknown, __: unknown, ctx: Context) => {
    await ctx.prisma.refreshToken.deleteMany({
      where: {
        OR: [{ expiresAt: { lt: new Date() } }, { revoked: true }],
      },
    })

    if (!ctx.req) {
      throw new GraphQLError('HTTP request not available', {
        extensions: { code: 'INTERNAL_SERVER_ERROR' },
      })
    }

    // // const token = ctx.req.headers.cookie
    // const token = ctx.req.cookies?.refreshToken
    //
    //
    // console.log('refreshToken', token)
    // if (!token) {
    //     throw new GraphQLError('No refresh token', {
    //         extensions: {code: 'UNAUTHENTICATED'},
    //     })
    // }
    //
    // const hash = crypto
    //     .createHash('sha256')
    //     .update(token) // ✅ HIER war der Bug
    //     .digest('hex')
    //
    // const stored = await ctx.prisma.refreshToken.findFirst({
    //     where: {
    //         tokenHash: hash,
    //         revoked: false,
    //         expiresAt: {gt: new Date()},
    //     },
    //     include: {user: true},
    // })

    const token = ctx.req.cookies?.refreshToken
    // if (!token) {
    //     throw new GraphQLError('No refresh token', {
    //         extensions: {code: 'UNAUTHENTICATED'},
    //     })
    // }

    const hash = crypto.createHash('sha256').update(token).digest('hex')

    const stored = await ctx.prisma.refreshToken.findFirst({
      where: {
        tokenHash: hash,
        revoked: false,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    })

    if (!stored) {
      throw new GraphQLError('Invalid refresh token', {
        extensions: { code: 'UNAUTHENTICATED' },
      })
    }

    if (stored.revoked) {
      // → Token wurde wiederverwendet → ALLE Sessions killen
      await ctx.prisma.refreshToken.updateMany({
        where: { userId: stored.userId },
        data: { revoked: true },
      })
      throw new GraphQLError('Token reuse detected', {
        extensions: { code: 'UNAUTHENTICATED' },
      })
    }

    // 🔒 Token rotieren
    await prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revoked: true },
    })
    // 🔁 Rotation: alten Token löschen
    // await ctx.prisma.refreshToken.delete({
    //     where: {id: stored.id},
    // })

    // await ctx.prisma.refreshToken.deleteMany({
    //     where: { tokenHash: hash },
    // })
    // 🔐 Neue Tokens
    const accessToken = signAccessToken(stored.user)
    const {
      token: newRefreshToken,
      hash: newHash,
      expiresAt,
    } = signRefreshToken()

    await ctx.prisma.refreshToken.create({
      data: {
        tokenHash: newHash,
        userId: stored.user.id,
        userAgent: ctx.req.headers['user-agent'] ?? null,
        ipAddress: ctx.req.ip ?? null,
        expiresAt,
      },
    })

    if (!ctx.res) {
      throw new GraphQLError('HTTP response not available', {
        extensions: { code: 'INTERNAL_SERVER_ERROR' },
      })
    }

    const isProd = process.env.NODE_ENV === 'production'

    ctx.res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: isProd, // 🔥 WICHTIG
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 30,
    })

    return {
      accessToken,
      user: stored.user,
    }
  },

  createDashboardForUser: async (
    _: unknown,
    args: {
      userId: string
      tabs: {
        title: any
        order: any
        groups: { title: any; order: any; items: any[] }[]
      }[]
    },
    ctx: Context,
  ) => {
    return ctx.prisma.$transaction(async (tx) => {
      function slugify(tag: string) {
        return tag
          .toLowerCase()
          .replace(/ä/g, 'ae')
          .replace(/ö/g, 'oe')
          .replace(/ü/g, 'ue')
          .replace(/ß/g, 'ss')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
      }

      await tx.tab.deleteMany({
        where: { userId: args.userId },
      })

      return tx.user.update({
        where: { id: args.userId },
        data: {
          tabs: {
            create: args.tabs.map((tab) => ({
              title: tab.title,
              order: tab.order,
              groups: {
                create: tab.groups.map((group) => ({
                  title: group.title,
                  order: group.order,
                  items: {
                    create: group.items.map((item) => ({
                      title: item.title,
                      url: item.url,
                      order: item.order,

                      ...(item.tags?.length
                        ? {
                            tags: {
                              create: item.tags.map((tagValue: string) => ({
                                tag: {
                                  connectOrCreate: {
                                    where: { slug: slugify(tagValue) },
                                    create: {
                                      name: tagValue,
                                      slug: slugify(tagValue),
                                    },
                                  },
                                },
                              })),
                            },
                          }
                        : {}),
                    })),
                  },
                })),
              },
            })),
          },
        },
      })
    })
  },

  registerUser: async (
    _: unknown,
    args: {
      email: string
      password: string
      passwordReplay: string
      firstName: string
      lastName: string
      displayName?: string | null
    },
    ctx: Context,
  ) => {
    const email = args.email.trim().toLowerCase()

    // 1) Check exists
    const existing = await ctx.prisma.user.findUnique({ where: { email } })
    if (existing) {
      throw new GraphQLError('E-Mail already registered', {
        extensions: { code: 'EMAIL_ALREADY_EXISTS' },
      })
    }

    // 2) Hash password
    if (!args.password || !args.passwordReplay) throw passwordError()
    if (args.password !== args.passwordReplay) throw passwordError()
    if (args.password.length < 12) throw passwordError()
    const hashedPassword = await bcrypt.hash(args.password, 12)

    // 3) Create user
    const user = await ctx.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName: args.firstName,
        lastName: args.lastName,
        displayName: getUserDisplayName(args),
        emailVerified: false,
      },
    })

    // 4) Create verification token
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h

    await ctx.prisma.emailVerification.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    })

    // 5) Send mail
    const verifyUrl = `${process.env.APP_URL}/verify?token=${token}`
    const mail = verifyEmailTemplate(user.firstName, verifyUrl)

    await sendMail({
      to: user.email,
      ...mail,
    })

    return { user }
  },

  verifyEmail: async (_: unknown, args: { token: string }, ctx: Context) => {
    const record = await ctx.prisma.emailVerification.findUnique({
      where: { token: args.token },
    })

    if (!record) {
      throw new GraphQLError('Invalid token', {
        extensions: { code: 'BAD_USER_INPUT' },
      })
    }

    if (record.expiresAt.getTime() < Date.now()) {
      // Token löschen (optional)
      await ctx.prisma.emailVerification.delete({
        where: { token: args.token },
      })

      throw new GraphQLError('Token expired', {
        extensions: { code: 'BAD_USER_INPUT' },
      })
    }

    const user = await ctx.prisma.user.update({
      where: { id: record.userId },
      data: { emailVerified: true },
    })

    // Token löschen (Einmal-Link)
    await ctx.prisma.emailVerification.delete({ where: { token: args.token } })

    const mail = welcomeTemplate(user.firstName)
    await sendMail({ to: user.email, ...mail })

    return true
  },

  requestPasswordReset: async (
    _: unknown,
    args: { email: string },
    ctx: Context,
  ) => {
    const email = args.email.toLowerCase().trim()

    const user = await ctx.prisma.user.findUnique({
      where: { email },
    })

    // 🔐 SECURITY: Immer true zurückgeben
    if (!user) return true

    // Alte Tokens löschen
    await ctx.prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    })

    await ctx.prisma.refreshToken.deleteMany({
      where: { userId: user.id },
    })

    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 Stunde

    await ctx.prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    })

    const resetUrl = `${process.env.APP_URL}/reset-password?token=${token}`

    const mail = resetPasswordTemplate(user.firstName, resetUrl)
    await sendMail({ to: user.email, ...mail })

    return true
  },

  resetPassword: async (
    _: unknown,
    args: { token: string; newPassword: string; newPasswordReplay: string },
    ctx: Context,
  ) => {
    const record = await ctx.prisma.passwordResetToken.findUnique({
      where: { token: args.token },
    })

    if (!record) {
      throw new GraphQLError('Ungültiger oder abgelaufener Link', {
        extensions: { code: 'INVALID_TOKEN' },
      })
    }

    if (record.expiresAt.getTime() < Date.now()) {
      await ctx.prisma.passwordResetToken.delete({
        where: { token: args.token },
      })

      throw new GraphQLError('Link ist abgelaufen', {
        extensions: { code: 'TOKEN_EXPIRED' },
      })
    }

    if (!args.newPassword || !args.newPasswordReplay) throw passwordError()
    if (args.newPassword !== args.newPasswordReplay) throw passwordError()
    if (args.newPassword.length < 12) throw passwordError()

    const hashedPassword = await bcrypt.hash(args.newPassword, 12)

    await ctx.prisma.user.update({
      where: { id: record.userId },
      data: {
        password: hashedPassword,
      },
    })

    // 🔥 Token ungültig machen
    await ctx.prisma.passwordResetToken.delete({
      where: { token: args.token },
    })

    return true
  },
}
