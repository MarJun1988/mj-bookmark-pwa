import { prisma } from '../../lib/prisma.js'
import { requireAuth } from '../../auth/requireAuth.js'
import type { Context } from '../../types/types.js'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client'
import { GraphQLError } from 'graphql/index.js'
import { setItemTags, setItemTagsByIds } from '../../utils/utils.js'
import type { Item } from '../../generated/prisma/client.js'
import { Prisma } from '@prisma/client/extension'
import { fetchLinkMeta } from '../../services/linkMeta.service.js'
import { refreshAllFavicons } from '../../services/refreshAllFavicons.js'

export const Mutation = {
  createItem: async (_: unknown, args: any, ctx: Context) => {
    requireAuth(ctx)

    if (args.input.type !== 'LINK' && !args.input.title?.trim()) {
      throw new GraphQLError('Title is required')
    }

    if (!args.input.groupId?.trim()) {
      throw new GraphQLError('Group is required')
    }

    let resolvedTitle = args.input.title?.trim()
    let resolvedFavicon: string | null = null
    let resolvedConfig: any = {}

    if (
      args.input.type === 'LINK' &&
      args.input.url?.trim() &&
      !resolvedTitle
    ) {
      try {
        const meta = await fetchLinkMeta(args.input.url.trim())

        resolvedTitle = resolvedTitle ?? meta.title
        resolvedFavicon = meta.favicon
        resolvedConfig = {
          meta: meta.meta,
        }
      } catch (err) {
        console.warn('⚠️ fetchLinkMeta failed', err)
      }
    }

    const item: Item = await ctx.prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        // 🔢 Reihenfolge automatisch bestimmen
        const lastItem = await tx.item.findFirst({
          where: { groupId: args.input.groupId },
          orderBy: { order: 'desc' },
          select: { order: true },
        })

        const order =
          args && args.input.order
            ? args.input.order
            : (lastItem?.order ?? 0) + 1

        return tx.item.create({
          data: {
            title: resolvedTitle,
            type: args.input.type?.trim(),
            groupId: args.input.groupId.trim(),
            order,
            url: args.input.url?.trim(),
            favicon: resolvedFavicon,
            config: resolvedConfig,
          },
        })
      },
    )

    if (args.input.tagIds) {
      await setItemTagsByIds(prisma, item.id, args.input.tagIds)
    }

    if (ctx && ctx.user && ctx.user.id) {
      // 📣 PubSub **AUSSERHALB** der Transaction
      console.log('ITEM_CREATED - createItem')

      await ctx.pubsub.publish('ITEM_CREATED', {
        itemCreated: item,
        userId: ctx.user.id,
      })
    }

    return ctx.prisma.item.findUnique({
      where: { id: item.id },
      include: {
        group: {
          include: {
            tab: true,
          },
        },
        tags: true,
      },
    })
  },
  updateItem: async (_: unknown, args: any, ctx: Context) => {
    requireAuth(ctx)

    if (args.input.type !== 'LINK' && !args.input.title?.trim()) {
      throw new GraphQLError('Title is required')
    }

    if (!args.input.groupId?.trim()) {
      throw new GraphQLError('Group is required')
    }

    try {
      let resolvedTitle = args.input.title?.trim()
      let resolvedFavicon: string | null = null
      let resolvedConfig: any = {}

      if (args.input.type === 'LINK' && args.input.url?.trim()) {
        try {
          const meta = await fetchLinkMeta(args.input.url.trim())

          resolvedTitle = resolvedTitle ?? meta.title
          resolvedFavicon = meta.favicon
          resolvedConfig = {
            meta: meta.meta,
          }
        } catch (err) {
          console.warn('⚠️ fetchLinkMeta failed', err)
        }
      }

      const item: Item | null = await ctx.prisma.item.findUnique({
        where: { id: args.id },
      })

      if (!item) {
        throw new GraphQLError('Item not found')
      }

      const itemUpdated = await prisma.item.update({
        where: { id: args.id },
        data: {
          title: resolvedTitle,
          order: args.input.order,
          groupId: args.input.groupId,
          url: args.input.url,
          favicon: resolvedFavicon,
          config: resolvedConfig,
          updatedAt: new Date(),
        },
      })

      if (args.input.tagIds) {
        await setItemTagsByIds(prisma, itemUpdated.id, args.input.tagIds)
      }

      if (ctx && ctx.user && ctx.user.id) {
        await ctx.pubsub.publish('ITEM_UPDATED', {
          itemUpdated,
          userId: ctx.user.id,
        })
      }

      return ctx.prisma.item.findUnique({
        where: { id: itemUpdated.id },
        include: {
          group: {
            include: {
              tab: true,
            },
          },
          tags: true,
        },
      })
    } catch (error: unknown) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new GraphQLError('Item not found', {
          extensions: { code: 'NOT_FOUND' },
        })
      }
      throw error
    }
  },
  deleteItem: async (_: unknown, { ids }: { ids: string[] }, ctx: Context) => {
    requireAuth(ctx)

    try {
      const items = await prisma.item.findMany({
        where: { id: { in: ids } },
      })

      await prisma.item.deleteMany({
        where: { id: { in: ids } },
      })

      const totalCount = await prisma.item.count({
        where: {
          group: {
            tab: {
              userId: ctx.user!.id,
            },
          },
        },
      })

      if (ctx && ctx.user && ctx.user.id) {
        for (const v of items) {
          await ctx.pubsub.publish('ITEM_DELETED', {
            itemDeleted: { deleted: [v], totalCount },
            userId: ctx.user.id,
          })
        }

        return { deleted: items, totalCount }
      }
    } catch (error: unknown) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new GraphQLError('Item not found', {
          extensions: { code: 'NOT_FOUND' },
        })
      }

      throw error
    }
  },

  setItemTags: async (_: unknown, args: any, ctx: Context) => {
    requireAuth(ctx)

    await setItemTags(ctx.prisma, args.id, args.tags)

    return ctx.prisma.item.findUnique({
      where: { id: args.id },
      include: { tags: true },
    })
  },

  refreshAllFavicons: async (_: unknown, { force }: { force: boolean }) => {
    return refreshAllFavicons({ force })
  },

  // setItemTags: async (
  //     _: unknown,
  //     { itemId, tags }: { itemId: string; tags: string[] },
  //     { prisma }: Context
  // ) => {
  //     const normalized = tags.map(normalizeTag)
  //
  //     console.log('normalized', normalized)
  //
  //     // Tags anlegen, falls sie nicht existieren
  //     const tagRecords = await Promise.all(
  //         normalized.map((name) =>
  //             prisma.tag.upsert({
  //                 where: { slug: name },
  //                 update: {},
  //                 create: {
  //                     name,
  //                     slug: name
  //                 }
  //             })
  //         )
  //     )
  //
  //     console.log('tagRecords', tagRecords)
  //
  //
  //     // Alte Relations löschen
  //     await prisma.itemTag.deleteMany({
  //         where: { itemId }
  //     })
  //
  //     // Neue Relations setzen
  //     await prisma.itemTag.createMany({
  //         data: tagRecords.map((tag) => ({
  //             itemId,
  //             tagId: tag.id
  //         }))
  //     })
  //
  //     return prisma.item.findUnique({
  //         where: { id: itemId }
  //     })
  // }
}
