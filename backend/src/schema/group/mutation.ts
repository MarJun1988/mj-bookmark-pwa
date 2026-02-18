import { prisma } from '../../lib/prisma.js'
import { requireAuth } from '../../auth/requireAuth.js'
import type { Context } from '../../types/types.js'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client'
import { GraphQLError } from 'graphql'
import { Prisma } from '@prisma/client/extension'
import type { Group } from '../../generated/prisma/client.js'

export const Mutation = {
  createGroup: async (_: unknown, args: any, ctx: Context) => {
    requireAuth(ctx)

    if (!args.title?.trim()) {
      throw new GraphQLError('Title is required')
    }

    if (!args.tabId?.trim()) {
      throw new GraphQLError('Tab is required')
    }

    const group: Group = await ctx.prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        // 🔢 Reihenfolge automatisch bestimmen
        const lastGroup = await tx.group.findFirst({
          where: { tabId: args.tabId },
          orderBy: { order: 'desc' },
          select: { order: true },
        })

        const order =
          args && args.order ? args.order : (lastGroup?.order ?? 0) + 1

        return tx.group.create({
          data: {
            title: args.title.trim(),
            tabId: args.tabId.trim(),
            order,
          },
          include: {
            tab: true,
          },
        })
      },
    )

    if (ctx && ctx.user && ctx.user.id) {
      // 📣 PubSub **AUSSERHALB** der Transaction
      console.log('GROUP_CREATED - createGroup')

      await ctx.pubsub.publish('GROUP_CREATED', {
        groupCreated: group,
        userId: ctx.user.id,
      })
    }

    return group
  },

  updateGroup: async (_: unknown, args: any, ctx: Context) => {
    requireAuth(ctx)

    const group: Group | null = await ctx.prisma.group.findUnique({
      where: { id: args.id },
    })

    // TODO:  || group.userId !== ctx.user!.id

    if (!group) {
      throw new GraphQLError('Group not found')
    }

    try {
      const groupUpdated = await prisma.group.update({
        where: { id: args.id },
        data: {
          title: args.title,
          order: args.order,
          tabId: args.tabId,
          updatedAt: new Date(),
        },
        include: {
          tab: true,
        },
      })
      if (ctx && ctx.user && ctx.user.id) {
        await ctx.pubsub.publish('GROUP_UPDATED', {
          groupUpdated,
          userId: ctx.user.id,
        })

        return groupUpdated
      }
    } catch (error: unknown) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new GraphQLError('Group not found', {
          extensions: { code: 'NOT_FOUND' },
        })
      }

      throw error
    }
  },

  deleteGroup: async (_: unknown, { ids }: { ids: string[] }, ctx: Context) => {
    requireAuth(ctx)

    try {
      const groups = await prisma.group.findMany({
        where: { id: { in: ids } },
      })

      await prisma.group.deleteMany({
        where: { id: { in: ids } },
      })

      const totalCount = await prisma.group.count({
        where: {
          tab: {
            userId: ctx.user!.id, // 🔐 User-Scope
          },
        },
      })

      if (ctx && ctx.user && ctx.user.id) {
        for (const v of groups) {
          await ctx.pubsub.publish('GROUP_DELETED', {
            groupDeleted: { deleted: [v], totalCount },
            userId: ctx.user.id,
          })
        }
      }

      return { deleted: groups, totalCount }
    } catch (error: unknown) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new GraphQLError('Group not found', {
          extensions: { code: 'NOT_FOUND' },
        })
      }

      throw error
    }
  },
}
