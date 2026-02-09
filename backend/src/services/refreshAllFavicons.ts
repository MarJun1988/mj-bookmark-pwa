import { fetchLinkMeta } from './linkMeta.service.js'
import { prisma } from '../lib/prisma.js'
import type { Context } from '../types/types.js'
import { requireAuth } from '../auth/requireAuth.js'

type RefreshFaviconsOptions = {
  force?: boolean // auch vorhandene Favicons neu laden
  limit?: number // optional begrenzen
}

type FaviconFailureReason = 'NO_FAVICON' | 'FETCH_FAILED' | 'EXCEPTION'

type FailedFavicon = {
  itemId: string
  url: string
  title: string
  reason: FaviconFailureReason
}

export async function refreshAllFavicons(options: RefreshFaviconsOptions = {}, ctx: Context) {
 requireAuth(ctx)
  const { force = false, limit } = options

  const items = await prisma.item.findMany({
    where: {
      url: { not: null },
      ...(force ? {} : { favicon: null }),
      group: {
        tab: {
          userId: ctx.user!.id,
        },
      },
    },
    ...(limit !== undefined ? { take: limit } : {}),
  })

  let success = 0
  const failedItems: FailedFavicon[] = []

  for (const item of items) {
    const url = item.url!
    const title = item.title!

    try {
      const meta = await fetchLinkMeta(url)

      if (!meta.favicon) {
        failedItems.push({
          itemId: item.id,
          url,
          title,
          reason: 'NO_FAVICON',
        })
        continue
      }

      await prisma.item.update({
        where: { id: item.id },
        data: { favicon: meta.favicon },
      })

      success++
    } catch {
      failedItems.push({
        itemId: item.id,
        url,
        title,
        reason: 'EXCEPTION',
      })
    }
  }

  return {
    total: items.length,
    success,
    failed: failedItems.length,
    failedItems,
  }
}