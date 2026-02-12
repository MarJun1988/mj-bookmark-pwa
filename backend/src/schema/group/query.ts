import {prisma} from '../../lib/prisma.js'
import {requireAuth} from '../../auth/requireAuth.js'
import {buildPrismaWhere} from "../../utils/utils.js";
import type {Context, PrismaFieldConfig} from "../../types/types.js";
import {PrismaClientKnownRequestError} from "@prisma/client/runtime/client";
import {GraphQLError} from "graphql/index.js";
import {Prisma} from "../../generated/prisma/client.js";
import {buildOrderBy} from "../../utils/datatable/buildOrderBy.js";

export const groupFieldConfig: PrismaFieldConfig = {
    title: {type: 'string'},
    order: {type: 'number'},
    createdAt: {type: 'date'},

    // 🔤 Relations (Textsuche)
    'tab.title': {
        type: 'string',
        path: ['tab', 'title'],
    },

    // ✅ MultiSelect (IDs!)
    'tabId': {
        type: 'in',
        path: ['tabId'],
    },
}

export const Query = {
    meGroups: async (_: unknown, __: unknown, ctx: Context) => {
        requireAuth(ctx)

        if (ctx && ctx.user && ctx.user.id) {
            return ctx.prisma.group.findMany({
                where: {
                    tab: {
                        userId: ctx.user.id, // 🔐 User-Scope
                    },
                },
                orderBy: [
                    {tab: {order: 'asc'}}, // optional
                    {order: 'asc'},
                ],
                include: {
                    tab: true, // 👈 extrem wichtig fürs Frontend
                },
            })
        }
    },
    groups: async (_: unknown, __: unknown, ctx: Context) => {
        requireAuth(ctx)
        return prisma.group.findMany({orderBy: {createdAt: 'desc'}})
    },
    group: async (_: unknown, {id}: { id: string }, ctx: Context) => {
        requireAuth(ctx)

        try {
            return prisma.group.findUnique({where: {id}})
        } catch (error: unknown) {
            if (
                error instanceof PrismaClientKnownRequestError &&
                error.code === 'P2025'
            ) {
                throw new GraphQLError('Version not found', {
                    extensions: {code: 'NOT_FOUND'}
                })
            }

            throw error
        }
    },

    groupsPaged: async (_: unknown, {page}: any, ctx: Context) => {
        requireAuth(ctx)

        const {
            first = 0,
            rows = 10,
            sortField,
            sortOrder,
            multiSortMeta,
            filters = {},
        } = page || {}

        const baseWhere = buildPrismaWhere(filters, groupFieldConfig)

        const andConditions: Prisma.GroupWhereInput[] = [
            // 🔐 User-Scope über Tab
            {
                tab: {
                    userId: ctx.user!.id,
                },
            },
            baseWhere,
        ]

        if (filters.global?.value) {
            const search = filters.global.value

            andConditions.push({
                OR: [
                    {title: {contains: search, mode: 'insensitive'}},
                    {
                        tab: {
                            title: {contains: search, mode: 'insensitive'},
                        },
                    },
                    {
                        items: {
                            some: {
                                title: {contains: search, mode: 'insensitive'},
                            },
                        },
                    },
                ],
            })
        }
        //
        const where: Prisma.GroupWhereInput = {
            AND: andConditions,
        }

        let orderBy: any = undefined

        if (Array.isArray(multiSortMeta) && multiSortMeta.length > 0) {
            orderBy = multiSortMeta.map((s) =>
                buildOrderBy(s.field, s.order)
            )
        } else if (sortField) {
            orderBy = buildOrderBy(sortField, sortOrder)
        }

        const [totalRecords, items] = await Promise.all([
            prisma.group.count({where}),
            prisma.group.findMany({
                where,
                skip: first,
                take: rows,
                orderBy,
                include: {
                    tab: true, // 👈 extrem wichtig fürs Frontend
                },
            }),
        ])

        return {totalRecords, items}
    },

    groupsForFilter: async (_: unknown, __: unknown, ctx: Context) => {
        requireAuth(ctx)

        return prisma.group.findMany({
            where: {
                tab: {
                    userId: ctx.user!.id, // 🔐 User-Scope
                },
            },
            orderBy: {title: 'asc'},
            select: {
                id: true,
                title: true,
            },
        })
    }

}
