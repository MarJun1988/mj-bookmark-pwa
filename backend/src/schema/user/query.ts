import { buildPrismaWhere } from '../../utils/utils.js'
import type { Context, PrismaFieldConfig } from '../../types/types.js'
import { requireAuth } from '../../auth/requireAuth.js'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client'
import { GraphQLError } from 'graphql/index.js'
import { prisma } from '../../lib/prisma.js'
import { Role } from '../../generated/prisma/enums.js'
import { Prisma } from '../../generated/prisma/client.js'
import { buildOrderBy } from '../../utils/datatable/buildOrderBy.js'

export const userFieldConfig: PrismaFieldConfig = {
  email: { type: 'string' },
  lastName: { type: 'string' },
  firstName: { type: 'string' },
  displayName: { type: 'string' },
  role: {
    type: 'enum',
    enumMap: {
      admin: Role.ADMIN,
      user: Role.USER,
      nutzer: Role.USER,
    },
  },
  createdAt: { type: 'date' },
}

export const Query = {
  me: async (_: unknown, __: unknown, ctx: Context) => {
    // if (!ctx.user.id) return null
    requireAuth(ctx)

    if (ctx && ctx.user && ctx.user.id) {
      return ctx.prisma.user.findUnique({
        where: { id: ctx.user.id },
      })
    }
  },
  users: async (_: unknown, __: unknown, ctx: Context) => {
    requireAuth(ctx, [Role.ADMIN])
    return prisma.user.findMany({ orderBy: { createdAt: 'desc' } })
  },
  user: async (_: unknown, { id }: { id: string }, ctx: Context) => {
    requireAuth(ctx)

    try {
      return ctx.prisma.user.findUnique({ where: { id } })
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
  usersPaged: async (_: unknown, { page }: any, ctx: Context) => {
    requireAuth(ctx)
    const {
      first = 0,
      rows = 10,
      sortField,
      sortOrder,
      multiSortMeta,
      filters = {},
    } = page || {}

    const where = buildPrismaWhere(filters, userFieldConfig)

    // 🔎 Globale Suche

    if (filters.global?.value) {
      const search = filters.global.value.trim()

      const or: Prisma.UserWhereInput[] = [
        { email: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { displayName: { contains: search, mode: 'insensitive' } },
      ]

      // 🔥 Role-Mapping (USER / ADMIN)
      const roleSearch = search.toUpperCase()
      if (roleSearch === 'USER' || roleSearch === 'ADMIN') {
        or.push({ role: roleSearch as Role })
      }

      where.OR = or
    }

    // ↕️ Sortierung
    let orderBy: any = undefined

    if (Array.isArray(multiSortMeta) && multiSortMeta.length > 0) {
      orderBy = multiSortMeta.map((s) => buildOrderBy(s.field, s.order))
    } else if (sortField) {
      orderBy = buildOrderBy(sortField, sortOrder)
    }

    const [totalRecords, items] = await Promise.all([
      ctx.prisma.user.count({ where }),
      ctx.prisma.user.findMany({
        where,
        skip: first,
        take: rows,
        orderBy,
      }),
    ])

    return { totalRecords, items }
  },
  exportBookmarks: async (
    _parent: unknown,
    _args: unknown,
    ctx: Context
  ) => {
    requireAuth(ctx)
    const tabs = await prisma.tab.findMany({
      where: { userId: ctx.user!.id },
      orderBy: { order: 'asc' },
      include: {
        groups: {
          orderBy: { order: 'asc' },
          include: {
            items: {
              orderBy: { order: 'asc' },
              include: {
                tags: {
                  include: {
                    tag: true
                  }
                }
              }
            }
          }
        }
      }
    });

    return {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      app: "mj-bookmark-pwa",
      data: {
        tabs: tabs.map(tab => ({
          title: tab.title,
          order: tab.order,
          groups: tab.groups.map(group => ({
            title: group.title,
            order: group.order,
            items: group.items.map(item => ({
              title: item.title,
              url: item.url,
              order: item.order,
              type: item.type,
              tags: item.tags.map(t => t.tag.name)
            }))
          }))
        }))
      }
    };
  }
}
