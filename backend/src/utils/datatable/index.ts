import { buildOrderBy, type SortMeta } from "./buildOrderBy.js";
import { type EntityName, SORTABLE_FIELDS } from "./sortableFields.js";

export function buildOrderByFromDataTable(
  entity: EntityName,
  multiSortMeta?: SortMeta[] | null,
): any[] | undefined {
  if (!Array.isArray(multiSortMeta) || multiSortMeta.length === 0) {
    return undefined;
  }

  const allowedFields = SORTABLE_FIELDS[entity];

  return multiSortMeta
    .filter((s) => allowedFields.has(s.field))
    .map((s) => buildOrderBy(s.field, s.order));
}
