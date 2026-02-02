import * as cheerio from 'cheerio'
import crypto from 'crypto'
import fs from 'fs/promises'
import path from 'path'
import { Agent, fetch } from 'undici'

/* ======================
   CONFIG
====================== */
const FAVICON_DIR = process.env.FAVICON_DIR ?? './data/favicons'

console.log('FAVICON_DIR', process.env.FAVICON_DIR)

// const FAVICON_DIR = path.join(process.cwd(), 'public', 'favicons')
const FETCH_TIMEOUT_MS = 8000

// const HEADERS = {
//   'User-Agent':
//     'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
//     'AppleWebKit/537.36 (KHTML, like Gecko) ' +
//     'Chrome/122.0.0.0 Safari/537.36',
//   Accept: 'text/html,application/xhtml+xml',
//   'Accept-Language': 'en-US,en;q=0.9',
// }

export const HTML_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
    'AppleWebKit/537.36 (KHTML, like Gecko) ' +
    'Chrome/122.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml',
  'Accept-Language': 'en-US,en;q=0.9',
}

export const IMAGE_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
    'AppleWebKit/537.36 (KHTML, like Gecko) ' +
    'Chrome/122.0.0.0 Safari/537.36',
  Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
}
export type LinkMetaResult = {
  title: string
  favicon: string | null
  meta: Record<string, unknown>
}

/* ======================
   DISPATCHER (SSL)
====================== */

const insecureDispatcher =
  process.env.ALLOW_INSECURE_SSL === 'true'
    ? new Agent({
        connect: {
          rejectUnauthorized: false,
        },
      })
    : null

function dispatcherOptions() {
  return insecureDispatcher ? { dispatcher: insecureDispatcher } : {}
}

/* ======================
   SAFE FETCH
====================== */

async function safeFetch(
  url: string,
  options: Record<string, unknown>,
  timeoutMs = FETCH_TIMEOUT_MS,
) {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeoutMs)

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    })
  } finally {
    clearTimeout(id)
  }
}

/* ======================
   ERROR NORMALIZER
====================== */

function normalizeFetchError(err: unknown, targetUrl: string) {
  const host = new URL(targetUrl).hostname

  if (err instanceof Error) {
    const msg = err.message.toLowerCase()

    if (msg.includes('terminated')) {
      return {
        code: 'FETCH_TERMINATED',
        message: `Connection terminated by remote host (${host}).`,
      }
    }

    if (msg.includes('aborted') || msg.includes('timeout')) {
      return {
        code: 'FETCH_TIMEOUT',
        message: `Request to ${host} timed out.`,
      }
    }

    if (msg.includes('self signed certificate')) {
      return {
        code: 'SSL_ERROR',
        message: `SSL certificate of ${host} is not trusted.`,
      }
    }

    if (msg.includes('certificate')) {
      return {
        code: 'SSL_ERROR',
        message: `SSL error while connecting to ${host}.`,
      }
    }

    return {
      code: 'FETCH_FAILED',
      message: `Failed to fetch content from ${host}.`,
    }
  }

  return {
    code: 'UNKNOWN_ERROR',
    message: 'An unknown error occurred while fetching the page.',
  }
}

/* ======================
   MAIN
====================== */

export async function fetchLinkMeta(url: string): Promise<LinkMetaResult> {
  console.log(`🔎 Fetching link meta: ${url}`)

  try {
    const res = await safeFetch(url, {
      ...dispatcherOptions(),
      redirect: 'follow',
      headers: HTML_HEADERS,
    })

    // ⚠️ HIER passiert der TERMINATED Fehler
    const html = await res.text()

    const $ = cheerio.load(html)

    const title =
      $('meta[property="og:title"]').attr('content') ||
      $('title').text() ||
      new URL(url).hostname

    const iconHref =
      $('link[rel="icon"]').attr('href') ||
      $('link[rel="shortcut icon"]').attr('href') ||
      $('link[rel="apple-touch-icon"]').attr('href') ||
      '/favicon.ico'

    const faviconUrl = new URL(iconHref, url).toString()
    const favicon = await downloadFavicon(faviconUrl)

    return {
      title: title.trim(),
      favicon,
      meta: {
        faviconOriginalUrl: faviconUrl,
        fetchedAt: new Date().toISOString(),
      },
    }
  } catch (err) {
    const normalized = normalizeFetchError(err, url)

    console.warn('⚠️ fetchLinkMeta failed', {
      url,
      ...normalized,
    })

    // ⛔ WICHTIG: HIER einen NEUEN Error werfen
    throw new Error(normalized.message)
  }
}

/* ======================
   FAVICON
====================== */

async function downloadFavicon(iconUrl: string): Promise<string | null> {
  console.log(`🖼️ Fetching favicon: ${iconUrl}`)

  try {
    await fs.mkdir(FAVICON_DIR, { recursive: true })

    const res = await safeFetch(iconUrl, {
      ...dispatcherOptions(),
      redirect: 'follow',
      headers: IMAGE_HEADERS,
    })

    if (!res.ok) return null

    const buffer = Buffer.from(await res.arrayBuffer())

    const hash = crypto.createHash('sha1').update(iconUrl).digest('hex')

    const contentType = res.headers.get('content-type') ?? ''

    const ext = contentType.includes('image/svg')
      ? 'svg'
      : contentType.includes('image/png')
        ? 'png'
        : contentType.includes('image/x-icon')
          ? 'ico'
          : 'ico'

    const fileName = `${hash}.${ext}`
    const filePath = path.join(FAVICON_DIR, fileName)

    try {
      await fs.access(filePath)
      return `/favicons/${fileName}`
    } catch {
      // Datei existiert noch nicht → schreiben
    }

    await fs.writeFile(filePath, buffer)

    return `/favicons/${fileName}`
  } catch (err) {
    const normalized = normalizeFetchError(err, iconUrl)

    console.warn('⚠️ favicon download failed', {
      url: iconUrl,
      ...normalized,
    })

    return null
  }
}
