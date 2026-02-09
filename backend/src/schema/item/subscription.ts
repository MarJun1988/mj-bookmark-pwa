import {withFilter} from "graphql-subscriptions";
import {pubsub} from "../../pubsub.js";
import type {ItemCreatedPayload, ItemDeletedPayload, ItemUpdatedPayload} from "./types.js";
import type {GraphQLContext} from "../../types/types.js";

export const Subscription = {
    itemCreated: {
        subscribe: (_parent: unknown,
                    _args: unknown,
                    ctx: GraphQLContext) => {
            console.log('📡 SUBSCRIBE itemCreated (registered)', {
                userId: ctx.user?.id,
                ip: ctx.ip,
            })

            return withFilter(
                () => pubsub.asyncIterator<ItemCreatedPayload>('ITEM_CREATED'),
                (payload, _variables, ctx) => {
                    console.log("ITEM_CREATED - subscribe", payload.itemCreated.tab, ctx.user)

                    // TODO:  &&
                    //                         payload.groupCreated.userId === ctx.user?.id
                    return (
                        !!ctx.user
                    )
                }
            )(_parent, _args, ctx)
        },

        // subscribe: withFilter(
        //     () => pubsub.asyncIterator<ItemCreatedPayload>('ITEM_CREATED'),
        //     (
        //         payload,
        //         _variables,
        //         ctx
        //     ) => {
        //         // 🔐 HIER DIE SICHERHEIT
        //         return payload.itemCreated.userId === ctx.user?.id
        //     }
        // ),
        // resolve: (payload: ItemCreatedPayload) => {
        //     // 👇 NUR das Group-Objekt geht an den Client
        //     return payload.itemCreated.item
        // }
    },
    itemUpdated: {
        subscribe: (_parent: unknown,
                    _args: unknown,
                    ctx: GraphQLContext) => {
            console.log('📡 SUBSCRIBE itemUpdated (registered)', {
                userId: ctx.user?.id,
                ip: ctx.ip,
            })

            return withFilter(
                () => pubsub.asyncIterator<ItemUpdatedPayload>('ITEM_UPDATED'),
                (payload, _variables, ctx) => {
                    console.log("ITEM_UPDATED", payload)
                    // TODO: &&
                    //                         payload.groupUpdated.userId === ctx.user?.id

                    return (
                        !!ctx.user
                    )
                }
            )(_parent, _args, ctx)
        },


        //
        // subscribe: withFilter(
        //     () => pubsub.asyncIterator<ItemUpdatedPayload>('ITEM_UPDATED'),
        //     (
        //         payload,
        //         _variables,
        //         ctx
        //     ) => {
        //         // 🔐 HIER DIE SICHERHEIT
        //         return payload.itemUpdated.userId === ctx.user?.id
        //     }
        // ),
        // resolve: (payload: ItemUpdatedPayload) => {
        //     // 👇 NUR das Group-Objekt geht an den Client
        //     return payload.itemUpdated.item
        // }
    },
    itemDeleted: {
        subscribe: (_parent: unknown,
                    _args: unknown,
                    ctx: GraphQLContext) => {
            console.log('📡 SUBSCRIBE itemDeleted (registered)', {
                userId: ctx.user?.id,
                ip: ctx.ip,
            })

            return withFilter(
                () => pubsub.asyncIterator<ItemDeletedPayload>('ITEM_DELETED'),
                (payload, _variables, ctx) => {
                    console.log("ITEM_DELETED", payload.itemDeleted)

                    // TODO:  &&
                    //                         payload.groupDeleted.deleted.userId === ctx.user?.id
                    return (
                        !!ctx.user
                    )
                }
            )(_parent, _args, ctx)
        },


        // subscribe: withFilter(
        //     () => pubsub.asyncIterator<ItemDeletedPayload>('ITEM_DELETED'),
        //     (
        //         payload,
        //         _variables,
        //         ctx
        //     ) => {
        //         // 🔐 HIER DIE SICHERHEIT
        //         return payload.itemDeleted.userId === ctx.user?.id
        //     }
        // ),
        // resolve: (payload: ItemDeletedPayload) => {
        //     // 👇 NUR das Group-Objekt geht an den Client
        //     return payload.itemDeleted.item
        // }
    },
}
