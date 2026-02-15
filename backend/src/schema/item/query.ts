import { prisma } from "../../lib/prisma.js";
import { requireAuth } from "../../auth/requireAuth.js";
import { buildPrismaWhere } from "../../utils/utils.js";
import type { Context, PrismaFieldConfig } from "../../types/types.js";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import { GraphQLError } from "graphql/index.js";
import { Prisma } from "../../generated/prisma/client.js";
import { buildOrderBy } from "../../utils/datatable/buildOrderBy.js";
import { fetchLinkMeta } from "../../services/linkMeta.service.js";

const itemFieldConfig: PrismaFieldConfig = {
  // 🔤 Text
  title: { type: "string" },
  url: { type: "string" },
  order: { type: "number" },

  // 🔤 Relations (Textsuche)
  "group.title": {
    type: "string",
    path: ["group", "title"],
  },

  "group.tab.title": {
    type: "string",
    path: ["group", "tab", "title"],
  },

  // ✅ MultiSelect (IDs!)
  "group.tab.id": {
    type: "in",
    path: ["group", "tab", "id"],
  },

  groupId: {
    type: "in",
    path: ["groupId"],
  },

  "tags.id": {
    type: "in",
    path: ["tags", "some", "tag", "id"],
  },
};

export const Query = {
  meTabsWithItems: async (_: unknown, __: unknown, ctx: Context) => {
    requireAuth(ctx);

    if (ctx && ctx.user && ctx.user.id) {
      return ctx.prisma.tab.findMany({
        where: { userId: ctx.user.id },
        orderBy: { order: "asc" },
        include: {
          groups: {
            orderBy: { order: "asc" },
            include: {
              items: {
                orderBy: { order: "asc" },
              },
            },
          },
        },
      });
    }
  },
  meItems: async (_: unknown, __: unknown, ctx: Context) => {
    requireAuth(ctx);

    if (ctx && ctx.user && ctx.user.id) {
      return ctx.prisma.item.findMany({
        where: {
          group: {
            tab: {
              userId: ctx.user.id,
            },
          },
        },
        orderBy: { order: "asc" },
      });
    }
  },
  items: async (_: unknown, __: unknown, ctx: Context) => {
    requireAuth(ctx);
    return prisma.item.findMany({
      orderBy: { createdAt: "desc" },
      include: { tags: true, group: true },
    });
  },
  item: async (_: unknown, { id }: { id: string }, ctx: Context) => {
    requireAuth(ctx);

    try {
      return prisma.item.findUnique({
        where: { id },
        include: {
          group: {
            include: {
              tab: true,
            },
          },
          tags: true,
        },
      });
    } catch (error: unknown) {
      if (error instanceof PrismaClientKnownRequestError && error.code === "P2025") {
        throw new GraphQLError("Item not found", {
          extensions: { code: "NOT_FOUND" },
        });
      }

      throw error;
    }
  },
  itemsPaged: async (_: unknown, { page }: any, ctx: Context) => {
    requireAuth(ctx);

    const { first = 0, rows = 10, sortField, sortOrder, multiSortMeta, filters = {} } = page || {};

    const baseWhere = buildPrismaWhere(filters, itemFieldConfig);

    const andConditions: Prisma.ItemWhereInput[] = [
      // 🔐 User-Scope über Group → Tab
      {
        group: {
          tab: {
            userId: ctx.user!.id,
          },
        },
      },

      // 🔎 Spaltenfilter
      baseWhere,
    ];

    if (filters.global?.value) {
      const search = filters.global.value;

      andConditions.push({
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { url: { contains: search, mode: "insensitive" } },
          {
            group: {
              title: { contains: search, mode: "insensitive" },
            },
          },
          {
            group: {
              tab: {
                title: { contains: search, mode: "insensitive" },
              },
            },
          },
          {
            tags: {
              some: {
                tag: {
                  name: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
              },
            },
          },
        ],
      });
    }

    const where: Prisma.ItemWhereInput = {
      AND: andConditions,
    };

    let orderBy: any = undefined;

    if (Array.isArray(multiSortMeta) && multiSortMeta.length > 0) {
      orderBy = multiSortMeta.map((s) => buildOrderBy(s.field, s.order));
    } else if (sortField) {
      orderBy = buildOrderBy(sortField, sortOrder);
    }

    const [totalRecords, items] = await Promise.all([
      prisma.item.count({ where }),
      prisma.item.findMany({
        where,
        skip: first,
        take: rows,
        orderBy,
        include: {
          group: {
            include: {
              tab: true,
            },
          },
          tags: true,
        },
      }),
    ]);

    return { totalRecords, items };
  },
  previewLinkMeta: async (_: unknown, { url }: { url: string }, ctx: Context) => {
    requireAuth(ctx);
    if (!url?.trim()) {
      throw new GraphQLError("URL required");
    }
    try {
      return await fetchLinkMeta(url);
    } catch (err) {
      throw new GraphQLError(
        err instanceof Error ? err.message : "Link konnte nicht geladen werden.",
        {
          extensions: {
            code: "LINK_META_FAILED",
          },
        },
      );
    }
  },

  itemsSearch: async (
    _: unknown,
    {
      groupId,
      filter,
    }: {
      groupId: string;
      filter?: { text?: string; tagSlugs?: string[] };
    },
    { prisma }: Context,
  ) => {
    return prisma.item.findMany({
      where: {
        groupId,
        AND: [
          filter?.text
            ? {
                OR: [
                  { title: { contains: filter.text, mode: "insensitive" } },
                  { url: { contains: filter.text, mode: "insensitive" } },
                ],
              }
            : {},

          filter?.tagSlugs?.length
            ? {
                AND: filter.tagSlugs.map((slug) => ({
                  tags: {
                    some: {
                      tag: { slug },
                    },
                  },
                })),
              }
            : {},
        ],
      },
      include: {
        tags: {
          include: { tag: true },
        },
      },
      orderBy: { order: "asc" },
    });
  },
};
