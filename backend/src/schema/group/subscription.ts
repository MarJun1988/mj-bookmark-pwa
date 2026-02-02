import {withFilter} from "graphql-subscriptions";
import {pubsub} from "../../pubsub.js";
import type {GroupCreatedPayload, GroupDeletedPayload, GroupUpdatedPayload} from "./types.js";
import type {GraphQLContext} from "../../types/types.js";

export const Subscription = {
    groupCreated: {
        subscribe: (_parent: unknown,
                    _args: unknown,
                    ctx: GraphQLContext) => {
            console.log('📡 SUBSCRIBE groupCreated (registered)', {
                userId: ctx.user?.id,
                ip: ctx.ip,
            })

            return withFilter(
                () => pubsub.asyncIterator<GroupCreatedPayload>('GROUP_CREATED'),
                (payload, _variables, ctx) => {
                    console.log("GROUP_CREATED - subscribe", payload.groupCreated.tab, ctx.user)

                    // TODO:  &&
                    //                         payload.groupCreated.userId === ctx.user?.id
                    return (
                        !!ctx.user
                    )
                }
            )(_parent, _args, ctx)
        },

        //
        // subscribe: withFilter(
        //     () => pubsub.asyncIterator<GroupCreatedPayload>('GROUP_CREATED'),
        //     (
        //         payload,
        //         _variables,
        //         ctx
        //     ) => {
        //         // 🔐 HIER DIE SICHERHEIT
        //         console.log('group created with');
        //         console.log('ctx', ctx.user);
        //         console.log('payload', payload.groupCreated);
        //         return payload.groupCreated.userId === ctx.user?.id
        //     }
        // ),
        // resolve: (payload: GroupCreatedPayload) => {
        //     // 👇 NUR das Group-Objekt geht an den Client
        //     console.log('resolve', payload);
        //     return payload.groupCreated
        // }
    },
    groupUpdated: {
        subscribe: (_parent: unknown,
                    _args: unknown,
                    ctx: GraphQLContext) => {
            console.log('📡 SUBSCRIBE groupUpdated (registered)', {
                userId: ctx.user?.id,
                ip: ctx.ip,
            })

            return withFilter(
                () => pubsub.asyncIterator<GroupUpdatedPayload>('GROUP_UPDATED'),
                (payload, _variables, ctx) => {
                    console.log("GROUP_UPDATED", payload)
                    // TODO: &&
                    //                         payload.groupUpdated.userId === ctx.user?.id

                    return (
                        !!ctx.user
                    )
                }
            )(_parent, _args, ctx)
        },

        // subscribe: withFilter(
        //     () => pubsub.asyncIterator<GroupUpdatedPayload>('GROUP_UPDATED'),
        //     (
        //         payload,
        //         _variables,
        //         ctx
        //     ) => {
        //         // 🔐 HIER DIE SICHERHEIT
        //         return payload.groupUpdated.userId === ctx.user?.id
        //     }
        // ),
        // resolve: (payload: GroupUpdatedPayload) => {
        //     // 👇 NUR das Group-Objekt geht an den Client
        //     return payload.groupUpdated.group
        // }
    },
    groupDeleted: {
        subscribe: (_parent: unknown,
                    _args: unknown,
                    ctx: GraphQLContext) => {
            console.log('📡 SUBSCRIBE groupDeleted (registered)', {
                userId: ctx.user?.id,
                ip: ctx.ip,
            })

            return withFilter(
                () => pubsub.asyncIterator<GroupDeletedPayload>('GROUP_DELETED'),
                (payload, _variables, ctx) => {
                    console.log("GROUP_DELETED", payload.groupDeleted)

                    // TODO:  &&
                    //                         payload.groupDeleted.deleted.userId === ctx.user?.id
                    return (
                        !!ctx.user
                    )
                }
            )(_parent, _args, ctx)
        },


        // subscribe: withFilter(
        //     () => pubsub.asyncIterator<GroupDeletedPayload>('GROUP_DELETED'),
        //     (
        //         payload,
        //         _variables,
        //         ctx
        //     ) => {
        //         // 🔐 HIER DIE SICHERHEIT
        //         return payload.groupDeleted.userId === ctx.user?.id
        //     }
        // ),
        // resolve: (payload: GroupDeletedPayload) => {
        //     // 👇 NUR das Group-Objekt geht an den Client
        //     return payload.groupDeleted.group
        // }
    },
}
