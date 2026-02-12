import {prisma} from '../../lib/prisma.js'
import {requireAuth} from '../../auth/requireAuth.js'
import type {Context} from "../../types/types.js";
import {PrismaClientKnownRequestError} from "@prisma/client/runtime/client";
import {GraphQLError} from "graphql/index.js";

export const Mutation = {
    createTag: async (_: unknown, args: any, ctx: Context) => {
        requireAuth(ctx)

        if (ctx && ctx.user && ctx.user.id) {
            const tag = await prisma.tag.create({data: args})
            await ctx.pubsub.publish('TAG_CREATED', {
                tagCreated: tag,
                userId: ctx.user.id
            })

            return tag
        }
    },
    updateTag: async (_: unknown, args: any, ctx: Context) => {
        requireAuth(ctx)

        try {
            const tagUpdated = await prisma.tag.update({
                where: {id: args.id},
                data: {
                    name: args.name,
                    slug: args.slug,
                    updatedAt: new Date(),
                },
            })

            if (ctx && ctx.user && ctx.user.id) {
                await ctx.pubsub.publish('TAG_UPDATED', {
                    tagUpdated,
                    userId: ctx.user.id
                })

                return tagUpdated
            }

        } catch (error: unknown) {
            if (
                error instanceof PrismaClientKnownRequestError &&
                error.code === 'P2025'
            ) {
                throw new GraphQLError('Tag not found', {
                    extensions: {code: 'NOT_FOUND'}
                })
            }

            throw error
        }
    },
    deleteTag: async (_: unknown, {ids}: { ids: string[] }, ctx: Context) => {
        requireAuth(ctx)

        try {
            const tags = await prisma.tag.findMany({
                where: {id: {in: ids}},
            })

            await prisma.tag.deleteMany({
                where: {id: {in: ids}},
            })

            const totalCount = await prisma.tag.count()

            if (ctx && ctx.user && ctx.user.id) {
                for (const v of tags) {
                    await ctx.pubsub.publish('TAG_DELETED', {
                        tagDeleted: {deleted: [v], totalCount},
                        userId: ctx.user.id
                    })
                }

                return {deleted: tags, totalCount}
            }
        } catch (error: unknown) {
            if (
                error instanceof PrismaClientKnownRequestError &&
                error.code === 'P2025'
            ) {
                throw new GraphQLError('Tag not found', {
                    extensions: {code: 'NOT_FOUND'}
                })
            }

            throw error
        }
    },
}
