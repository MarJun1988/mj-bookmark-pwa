import bcrypt from 'bcrypt'
import type { Context, DataTableFilters, PrismaFieldConfig, PrismaWhere, } from '../types/types.js'

/**
 * Datum „normalisieren“ (Uhrzeit auf 00:00:00 setzen)
 * @param dateStr
 */
function normalizeDate(dateStr: string | number) {
  const d = new Date(dateStr)
  d.setHours(0, 0, 0, 0)
  return d
}

/**
 * Zusammensetzen der Filter
 * @param filters
 * @param fieldConfig
 */
export const buildPrismaWhere = (
  filters: DataTableFilters = {},
  fieldConfig: PrismaFieldConfig,
): PrismaWhere => {
  const where: PrismaWhere = {}

  if (!filters) return where

  for (const [field, filter] of Object.entries(filters)) {
    if (field === 'global') continue
    if (!filter?.value) continue
    if (!fieldConfig[field]) continue // 🔥 unbekanntes Feld ignorieren
    if (
      filter.matchMode === 'in' &&
      Array.isArray(filter.value) &&
      filter.value.length === 0
    ) {
      continue
    }

    const { type, enumMap } = fieldConfig[field]
    const value = filter.value
    const mode = 'insensitive'

    const config = fieldConfig[field]

    const path: string[] =
      Array.isArray(config.path) && config.path.length > 0
        ? config.path
        : [field]

    let cursor: Record<string, unknown> = where

    for (let i = 0; i < path.length - 1; i++) {
      const key = path[i]
      if (typeof key !== 'string') continue

      if (typeof cursor[key] !== 'object' || cursor[key] === null) {
        cursor[key] = {}
      }

      cursor = cursor[key] as Record<string, unknown>
    }

    const last = path[path.length - 1]
    if (typeof last !== 'string') continue

    cursor[last] = { contains: value, mode }
    if (type === 'enum') {
      if (filter.matchMode === 'in') {
        const values = Array.isArray(value) ? value : [value]

        cursor[last] = {
          in: values.map((v) => enumMap?.[String(v).toLowerCase()] ?? v),
        }

        // where[field] = {
        //     in: values.map(v =>
        //         enumMap?.[String(v).toLowerCase()] ?? v
        //     ),
        // }
      } else {
        const mapped = enumMap?.[String(value).toLowerCase()] ?? value

        cursor[last] = mapped
      }

      continue
    }

    // 🔹 DATE
    if (type === 'date') {
      const date = normalizeDate(value)

      switch (filter.matchMode) {
        case 'dateIs':
          cursor[last] = {
            gte: date,
            lt: new Date(date.getTime() + 86400000),
          }
          // where[field] = {
          //     gte: date,
          //     lt: new Date(date.getTime() + 86400000),
          // }
          break
        case 'dateBefore':
          cursor[last] = { lt: date }
          break
        case 'dateAfter':
          cursor[last] = { gt: date }
          break
      }
      continue
    }

    // 🔹 STRING / NUMBER
    switch (filter.matchMode) {
      case 'startsWith':
        cursor[last] = { startsWith: value, mode }
        break
      case 'endsWith':
        cursor[last] = { endsWith: value, mode }
        break
      case 'contains':
        cursor[last] = { contains: value, mode }
        break
      case 'equals':
        cursor[last] = { equals: value }
        break
      case 'notEquals':
        cursor[last] = { not: value }
        break
      case 'in':
        cursor[last] = {
          in: Array.isArray(value) ? value : [value],
        }
        break
      case 'lt':
      case 'gt':
      case 'lte':
      case 'gte':
        cursor[last] = { [filter.matchMode]: value }
        break
      default:
        cursor[last] = { contains: value, mode }
    }
  }

  return where
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

/**
 * Validates whether a string is a syntactically valid email address.
 *
 * This check is intentionally kept simple and pragmatic:
 * - Ensures the presence of a single `@`
 * - Ensures a non-empty local part and domain
 * - Ensures the domain contains at least one dot
 *
 * It does NOT attempt full RFC 5322 compliance, as that would be
 * overly complex and error-prone for real-world applications.
 *
 * This function is suitable for:
 * - Backend input validation
 * - GraphQL resolver guards
 * - Registration / bootstrap flows
 *
 * @param email - The email address to validate
 * @returns `true` if the email has a valid basic format, otherwise `false`
 *
 * @example
 * isValidEmail('user@example.com') // true
 * isValidEmail('invalid-email')    // false
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

/**
 * Normalizes a user-provided tag or hashtag into a canonical slug.
 *
 * This function is used to ensure consistent storage and comparison of tags
 * across the system (search, filtering, autocomplete).
 *
 * Normalization rules:
 * - converts to lowercase
 * - trims leading/trailing whitespace
 * - removes a leading '#' character if present
 *
 * Examples:
 * - "#Vue"        -> "vue"
 * - "  GraphQL "  -> "graphql"
 * - "#Frontend"  -> "frontend"
 *
 * @returns Normalized tag slug suitable for persistence and filtering
 * @param raw
 */
// export function normalizeTag(tag: string) {
//     return tag
//         .toLowerCase()
//         .trim()
//         .replace(/^#/, '')
// }

export function normalizeTagSlug(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/^#+/, '') // alle führenden #
    .replace(/\s+/g, '-') // leerzeichen → -
}

export function normalizeTagName(raw: string): string {
  return raw
    .trim()
    .replace(/^#+/, '') // alle führenden #
    .replace(/\s+/g, '-') // leerzeichen → -
}

export async function setItemTagsByIds(
  prisma: Context['prisma'],
  itemId: string,
  tagIds: string[],
) {
  // Alte Relationen löschen
  await prisma.itemTag.deleteMany({
    where: { itemId },
  })

  if (tagIds.length === 0) return

  // Neue Relationen setzen
  await prisma.itemTag.createMany({
    data: tagIds.map((tagId) => ({
      itemId,
      tagId,
    })),
  })
}

async function resolveTags(prisma: Context['prisma'], tags: string[]) {
  // const normalizedSlug = [
  //     ...new Set(tags.map(normalizeTagSlug).filter(Boolean))
  // ]

  const normalizedName = [
    ...new Set(tags.map(normalizeTagName).filter(Boolean)),
  ]

  if (normalizedName.length === 0) return []

  const tagRecords = await Promise.all(
    normalizedName.map((name) =>
      prisma.tag.upsert({
        where: { slug: normalizeTagSlug(name) },
        update: {},
        create: {
          name,
          slug: normalizeTagSlug(name),
        },
      }),
    ),
  )

  return tagRecords
}

export async function setItemTags(
  prisma: Context['prisma'],
  itemId: string,
  tags: string[],
) {
  const tagRecords: {
    id: string
    name: string
    createdAt: Date
    updatedAt: Date
    slug: string
  }[] = await resolveTags(prisma, tags)

  await prisma.itemTag.deleteMany({
    where: { itemId },
  })

  if (tagRecords.length === 0) return

  await prisma.itemTag.createMany({
    data: tagRecords.map((tag) => ({
      itemId,
      tagId: tag.id,
    })),
  })
}

//
// export function buildOrderBy(
//     field: string,
//     order: 1 | -1
// ) {
//     const direction = order === 1 ? 'asc' : 'desc'
//     const keys = field.split('.')
//
//     let result: any = direction
//
//     for (let i = keys.length - 1; i >= 0; i--) {
//         const key = keys[i]
//         if (!key) continue
//
//         result = { [key]: result }
//     }
//
//     return result
// }

export type SortMeta = {
  field: string
  order: 1 | -1
}

/**
 * Baut ein Prisma-kompatibles orderBy Objekt aus Dot-Notation
 * z. B. "group.tab.title" → { group: { tab: { title: 'asc' }}}
 */
// export function buildOrderBy(
//     field: string,
//     order: 1 | -1
// ): Record<string, any> {
//     const direction = order === 1 ? 'asc' : 'desc'
//
//     let result: any = direction
//
//     for (const key of field.split('.').reverse()) {
//         result = { [key]: result }
//     }
//
//     return result
// }

export function getUserDisplayName(user: {
  firstName: string
  lastName: string
  displayName?: string | null
}) {
  if (user.displayName?.trim()) {
    return user.displayName
  }

  const f = user.firstName?.trim()?.[0] ?? ''
  const l = user.lastName?.trim()?.[0] ?? ''

  return `${f}${l}`.toUpperCase()
}