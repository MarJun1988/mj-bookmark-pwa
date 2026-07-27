// utils/datatable/sortableFields.ts

export const SORTABLE_FIELDS = {
  item: new Set(["title", "order", "createdAt", "updatedAt", "group.title", "group.tab.title"]),

  group: new Set(["title", "order", "tab.title", "createdAt"]),

  tab: new Set(["title", "order", "createdAt"]),
} as const;

export type EntityName = keyof typeof SORTABLE_FIELDS;
