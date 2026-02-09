import { prisma } from '../../lib/prisma.js'
import { requireAuth } from '../../auth/requireAuth.js'
import { buildPrismaWhere } from "../../utils/utils.js";
import type { Context, PrismaFieldConfig } from "../../types/types.js";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import { GraphQLError } from "graphql/index.js";
import { buildOrderBy } from "../../utils/datatable/buildOrderBy.js";
import type { Prisma } from '../../generated/prisma/client.js';

export const tagFieldConfig: PrismaFieldConfig = {
    name: { type: 'string' },
    slug: { type: 'string' },
    createdAt: { type: 'date' },
}


export const Query = {
    tags: async (_: unknown, __: unknown, ctx: Context) => {
        requireAuth(ctx)
        return prisma.tag.findMany({ orderBy: { createdAt: 'desc' } })
    },
    tag: async (_: unknown, { id }: { id: string }, ctx: Context) => {
        requireAuth(ctx)

        try {
            return prisma.tag.findUnique({ where: { id } })
        } catch (error: unknown) {
            if (
                error instanceof PrismaClientKnownRequestError &&
                error.code === 'P2025'
            ) {
                throw new GraphQLError('Tag not found', {
                    extensions: { code: 'NOT_FOUND' }
                })
            }

            throw error
        }
    },
    tagsPaged: async (_: unknown, { page }: any, ctx: Context) => {
        requireAuth(ctx)

        const {
            first = 0,
            rows = 10,
            sortField,
            sortOrder,
            multiSortMeta,
            filters = {},
        } = page || {}

        const where = buildPrismaWhere(filters, tagFieldConfig)

        if (filters.global?.value) {
            const search = filters.global.value
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { slug: { contains: search, mode: 'insensitive' } },
            ]
        }

        let orderBy: any = undefined

        if (Array.isArray(multiSortMeta) && multiSortMeta.length > 0) {
            orderBy = multiSortMeta.map((s) =>
                buildOrderBy(s.field, s.order)
            )
        } else if (sortField) {
            orderBy = buildOrderBy(sortField, sortOrder)
        }

        const [totalRecords, tags] = await Promise.all([
            prisma.tag.count({ where }),
            prisma.tag.findMany({
                where,
                skip: first,
                take: rows,
                orderBy,
            }),
        ])

        return { totalRecords, tags }
    },
    tagsForFilter: async (_: unknown, __: unknown, ctx: Context) => {
        requireAuth(ctx)

        return prisma.tag.findMany({
            orderBy: { name: 'asc' },
            select: {
                id: true,
                name: true,
                slug: true,
            },
        })
    },
    tagsSearchAutocomplete: async (
        _: unknown,
        { query, limit = 20 }: { query?: string; limit?: number },
        ctx: Context
    ) => {
        requireAuth(ctx);

        const where: Prisma.TagWhereInput = {};

        if (query?.trim()) {
            const search = query.trim();
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { slug: { contains: search, mode: 'insensitive' } },
            ];
        }

        return prisma.tag.findMany({
            where,
            orderBy: { name: 'asc' },
            take: Math.min(limit, 50), // Hard Cap (Sicherheit)
            select: {
                id: true,
                name: true,
                slug: true,
            },
        });
    },

}
