import bcrypt from 'bcrypt'
import { getUserDisplayName, isValidEmail } from '../../utils/utils.js'
import { GraphQLError } from 'graphql/index.js'
import { requireAuth } from '../../auth/requireAuth.js'
import type { Context } from '../../types/types.js'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client'
import { Role } from '../../generated/prisma/enums.js'
import type { User } from '../../generated/prisma/client.js'
import { verifyEmailTemplate } from '../../mail/templates/verifyEmail.js'
import { sendMail } from '../../mail/sendMail.js'
import crypto from 'node:crypto'
import { passwordError } from './types.js'

export const Mutation = {
  createUser: async (_: unknown, args: any, ctx: Context) => {
    requireAuth(ctx, [Role.ADMIN])

    if (!isValidEmail(args.email)) {
      throw new GraphQLError('Invalid email address', {
        extensions: { code: 'BAD_USER_INPUT' },
      })
    }

    const count = await ctx.prisma.user.count({
      where: { email: args.email.trim().toLowerCase() },
    })

    if (count > 0) {
      throw new GraphQLError(
        'An account with this email address already exists.',
        {
          extensions: { code: 'BAD_USER_INPUT' },
        },
      )
    }

    if (ctx && ctx.user && ctx.user.id) {
      const password = await bcrypt.hash(args.password, 12)

      const user = await ctx.prisma.user.create({
        data: {
          email: args.email.trim().toLowerCase(),
          password,
          lastName: args.lastName,
          firstName: args.firstName,
          displayName: getUserDisplayName(args),
          role: args.role ?? 'USER',
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

      await ctx.pubsub.publish('USER_CREATED', {
        userCreated: user,
        userId: ctx.user.id,
        requireRole: [Role.ADMIN],
      })
      return user
    }
  },

  updateUser: async (_: unknown, args: any, ctx: Context) => {
    requireAuth(ctx)

    const data: Partial<User> = {
      id: ctx.user!.id,
    }

    // ✉️ Email ändern
    if (args.email !== undefined) {
      const email = args.email.trim().toLowerCase()

      if (!isValidEmail(email)) {
        throw new GraphQLError('Invalid email address', {
          extensions: { code: 'BAD_USER_INPUT' },
        })
      }

      const exists = await ctx.prisma.user.findFirst({
        where: {
          email,
          NOT: { id: args.id }, // 👈 eigene E-Mail erlauben
        },
        select: { id: true },
      })

      if (exists) {
        throw new GraphQLError(
          'An account with this email address already exists.',
          { extensions: { code: 'BAD_USER_INPUT' } },
        )
      }

      data.email = email
    }

    // 🔐 Passwort ändern
    if (args.password !== undefined) {
      data.password = await bcrypt.hash(args.password, 12)
    }

    // 🧾 Optionale Felder
    if (args.firstName !== undefined) {
      data.firstName = args.firstName
    }
    if (args.lastName !== undefined) {
      data.lastName = args.lastName
    }

    if (args.displayName !== undefined) {
      data.displayName = args.displayName
    }

    if (args.role !== undefined) {
      data.role = args.role
    }

    try {
      if (ctx && ctx.user && ctx.user.id) {
        const userUpdated = await ctx.prisma.user.update({
          where: { id: args.id },
          data,
        })

        await ctx.pubsub.publish('USER_UPDATED', {
          userUpdated: userUpdated,
          userId: ctx.user.id,
          requireRole: [Role.ADMIN],
        })

        return userUpdated
      }
    } catch (error: unknown) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new GraphQLError('User not found', {
          extensions: { code: 'NOT_FOUND' },
        })
      }

      throw error
    }
  },

  updateUserPassword: async (_: unknown, args: any, ctx: Context) => {
    requireAuth(ctx)

    if (!args.oldPassword) throw passwordError()
    if (!args.newPassword || !args.newPasswordReplay) throw passwordError()
    if (args.newPassword !== args.newPasswordReplay) throw passwordError()
    if (args.newPassword.length < 12) throw passwordError()

    try {
      if (ctx && ctx.user && ctx.user.id) {
        const user = await ctx.prisma.user.findUnique({
          where: { id: ctx.user.id },
        })

        if (!user) {
          throw new GraphQLError('User not found', {
            extensions: { code: 'NOT_FOUND' },
          })
        }
        // ✅ RICHTIGER VERGLEICH
        const isValidOldPassword = await bcrypt.compare(
          args.oldPassword,
          user.password,
        )

        if (!isValidOldPassword) throw passwordError()

        const sameAsOld = await bcrypt.compare(args.newPassword, user.password)
        if (sameAsOld) throw passwordError()

        // 🔐 Neues Passwort hashen
        const newPasswordHash = await bcrypt.hash(args.newPassword, 12)

        const userUpdated = await ctx.prisma.user.update({
          where: { id: ctx.user.id },
          data: {
            password: newPasswordHash,
          },
        })

        await ctx.prisma.refreshToken.deleteMany({
          where: { userId: ctx.user.id },
        })

        await ctx.pubsub.publish('USER_UPDATED_PASSWORD', {
          userUpdated: userUpdated,
          userId: ctx.user.id,
          requireRole: [Role.ADMIN],
        })

        return userUpdated
      }
    } catch (error: unknown) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new GraphQLError('User not found', {
          extensions: { code: 'NOT_FOUND' },
        })
      }

      throw error
    }
  },

  deleteUsers: async (_: unknown, { ids }: { ids: string[] }, ctx: Context) => {
    requireAuth(ctx, ['ADMIN'])

    try {
      if (ctx && ctx.user && ctx.user.id) {
        const users = await ctx.prisma.user.findMany({
          where: { id: { in: ids } },
        })

        await ctx.prisma.user.deleteMany({
          where: { id: { in: ids } },
        })

        const totalCount = await ctx.prisma.user.count()

        for (const user of users) {
          await ctx.pubsub.publish('USER_DELETED', {
            user: user,
            totalCount,
            userId: ctx.user.id,
            requireRole: [Role.ADMIN],
          })
        }

        return {
          usersDeleted: users,
          totalCount,
        }
      }
    } catch (error: unknown) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new GraphQLError('User not found', {
          extensions: { code: 'NOT_FOUND' },
        })
      }

      throw error
    }
  },
}
