export type SortMeta = {
    field: string
    order: 1 | -1
}

/**
 * Baut ein Prisma-kompatibles orderBy Objekt aus Dot-Notation
 * z. B. "group.tab.title" → { group: { tab: { title: 'asc' }}}
 */
export function buildOrderBy(
    field: string,
    order: 1 | -1
): Record<string, any> {
    const direction = order === 1 ? 'asc' : 'desc'

    let result: any = direction

    for (const key of field.split('.').reverse()) {
        result = {[key]: result}
    }

    return result
}
