import { requireAuth } from "../../auth/requireAuth.js";
import { buildPrismaWhere } from "../../utils/utils.js";
import type { Context, PrismaFieldConfig } from "../../types/types.js";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import { GraphQLError } from "graphql/index.js";
import { buildOrderBy } from "../../utils/datatable/buildOrderBy.js";

export const versionFieldConfig: PrismaFieldConfig = {
  versionNumber: { type: "string" },
  description: { type: "string" },
  createdAt: { type: "date" },
};

export const Query = {
  versions: async (_: unknown, __: unknown, ctx: Context) => {
    // requireAuth(ctx)
    return ctx.prisma.version.findMany({ orderBy: { versionNumber: "desc" } }) ?? [];
  },
  version: async (_: unknown, { id }: { id: string }, ctx: Context) => {
    requireAuth(ctx);

    try {
      return ctx.prisma.version.findUnique({ where: { id } });
    } catch (error: unknown) {
      if (error instanceof PrismaClientKnownRequestError && error.code === "P2025") {
        throw new GraphQLError("Version not found", {
          extensions: { code: "NOT_FOUND" },
        });
      }

      throw error;
    }
  },
  versionsPaged: async (_: unknown, { page }: any, ctx: Context) => {
    requireAuth(ctx);

    const { first = 0, rows = 10, sortField, sortOrder, multiSortMeta, filters = {} } = page || {};

    const where = buildPrismaWhere(filters, versionFieldConfig);

    if (filters.global?.value) {
      const search = filters.global.value;
      where.OR = [
        { versionNumber: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    let orderBy: any = undefined;

    if (Array.isArray(multiSortMeta) && multiSortMeta.length > 0) {
      orderBy = multiSortMeta.map((s) => buildOrderBy(s.field, s.order));
    } else if (sortField) {
      orderBy = buildOrderBy(sortField, sortOrder);
    }

    const [totalRecords, items] = await Promise.all([
      ctx.prisma.version.count({ where }),
      ctx.prisma.version.findMany({
        where,
        skip: first,
        take: rows,
        orderBy,
      }),
    ]);

    return { totalRecords, items };
  },
};
