import { prisma } from '../../lib/prisma.js'
import { requireAuth } from '../../auth/requireAuth.js'
import { buildPrismaWhere } from '../../utils/utils.js'
import type { Context, PrismaFieldConfig } from '../../types/types.js'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client'
import { GraphQLError } from 'graphql/index.js'
import { Prisma } from '../../generated/prisma/client.js'
import { buildOrderBy } from '../../utils/datatable/buildOrderBy.js'

export const tabFieldConfig: PrismaFieldConfig = {
  title: { type: 'string' },
  order: { type: 'number' },
  createdAt: { type: 'date' },
}

export const Query = {
  meTabs: async (_: unknown, __: unknown, ctx: Context) => {
    requireAuth(ctx)
    return prisma.tab.findMany({
      where: { userId: ctx.user!.id },
      orderBy: { order: 'asc' },
    })
  },
  tabs: async (_: unknown, __: unknown, ctx: Context) => {
    requireAuth(ctx)
    return prisma.tab.findMany({
      where: { userId: ctx.user!.id },
      orderBy: { userId: 'asc', order: 'asc' },
    })
  },

  tab: async (_: unknown, { id }: { id: string }, ctx: Context) => {
    requireAuth(ctx)

    try {
      return prisma.tab.findUnique({ where: { id, userId: ctx.user!.id } })
    } catch (error: unknown) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new GraphQLError('Tab not found', {
          extensions: { code: 'NOT_FOUND' },
        })
      }

      throw error
    }
  },
  tabsPaged: async (_: unknown, { page }: any, ctx: Context) => {
    requireAuth(ctx)

    const {
      first = 0,
      rows = 10,
      sortField,
      sortOrder,
      multiSortMeta,
      filters = {},
    } = page || {}

    const baseWhere = buildPrismaWhere(filters, tabFieldConfig)

    const andConditions: Prisma.TabWhereInput[] = [
      { userId: ctx.user!.id },
      baseWhere,
    ]

    if (filters.global?.value) {
      const search = filters.global.value

      andConditions.push({
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          {
            groups: {
              some: {
                title: { contains: search, mode: 'insensitive' },
              },
            },
          },
          {
            user: {
              lastName: { contains: search, mode: 'insensitive' },
              firstName: { contains: search, mode: 'insensitive' },
              displayName: { contains: search, mode: 'insensitive' },
            },
          },
        ],
      })
    }

    const where: Prisma.TabWhereInput = {
      AND: andConditions,
    }

    let orderBy: any = undefined

    if (Array.isArray(multiSortMeta) && multiSortMeta.length > 0) {
      orderBy = multiSortMeta.map((s) => buildOrderBy(s.field, s.order))
    } else if (sortField) {
      orderBy = buildOrderBy(sortField, sortOrder)
    }

    const [totalRecords, items] = await Promise.all([
      prisma.tab.count({ where }),
      prisma.tab.findMany({
        where,
        skip: first,
        take: rows,
        orderBy,
      }),
    ])

    return { totalRecords, items }
  },

  tabsForFilter: async (_: unknown, __: unknown, ctx: Context) => {
    requireAuth(ctx)

    return prisma.tab.findMany({
      where: { userId: ctx.user!.id },
      orderBy: { title: 'asc' },
      select: {
        id: true,
        title: true,
      },
    })
  },
}
