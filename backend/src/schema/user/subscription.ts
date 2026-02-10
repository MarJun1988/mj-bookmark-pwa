import {withFilter} from "graphql-subscriptions";
import {pubsub} from "../../pubsub.js";
import type {UserCreatedPayload} from "./types.js";
import type {GraphQLContext} from "../../types/types.js";

export const Subscription = {
    userCreated: {
        subscribe: (_parent: unknown,
                    _args: unknown,
                    ctx: GraphQLContext) => {
            console.log('📡 SUBSCRIBE userCreated (registered)', {
                userId: ctx.user?.id,
                ip: ctx.ip,
            })

            return withFilter(
                () => pubsub.asyncIterator<UserCreatedPayload>('USER_CREATED'),
                (payload, _variables, ctx) => {
                    return (
                        !!ctx.user &&
                        payload.requireRole.includes(ctx.user.role)
                    )
                }
            )(_parent, _args, ctx)
        },
        // subscribe: withFilter(
        //     () => pubsub.asyncIterator<UserCreatedPayload>('USER_CREATED'),
        //     (
        //         payload,
        //         _variables,
        //         ctx
        //     ) => {
        //
        //         // 🔐 HIER DIE SICHERHEIT
        //         // return payload.userCreated.userId === ctx.user?.id
        //         return ctx.user && payload.requireRole.includes(ctx.user.role);
        //     }
        // ),
        // resolve: (payload: UserCreatedPayload) => {
        //     // 👇 NUR das User-Objekt geht an den Client
        //     return payload.userCreated
        // }
    },
    userUpdated: {
        subscribe: (_parent: unknown,
                    _args: unknown,
                    ctx: GraphQLContext) => {
            console.log('📡 SUBSCRIBE userUpdated (registered)', {
                userId: ctx.user?.id,
                ip: ctx.ip,
            })

            return withFilter(
                () => pubsub.asyncIterator<UserCreatedPayload>('USER_UPDATED'),
                (payload, _variables, ctx) => {
                    return (
                        !!ctx.user &&
                        payload.userUpdated.id === ctx.user?.id ||
                        payload.requireRole.includes(ctx.user.role)
                    )
                }
            )(_parent, _args, ctx)
            //
            //
            //     subscribe: withFilter(
            //         () => pubsub.asyncIterator<UserUpdatedPayload>('USER_UPDATED'),
            //         (
            //             payload,
            //             _variables,
            //             ctx
            //         ) => {
            //             // 🔐 HIER DIE SICHERHEIT
            //             // Hinweis: hier muss geprüft werden, dass nur ADMIN Role oder der eigene Nutzer ein Update per Subscribe bekommen!
            //             return ctx.user && payload.userUpdated.id === ctx.user?.id || payload.requireRole.includes(ctx.user.role)
            //         }
            //     ),
            //         resolve
            // :
            //     (payload: UserUpdatedPayload) => {
            //         // 👇 NUR das User-Objekt geht an den Client
            //         return payload.userUpdated
            //     }
        },
    },
    userDeleted: {
        subscribe: (_parent: unknown,
                    _args: unknown,
                    ctx: GraphQLContext) => {
            console.log('📡 SUBSCRIBE userDeleted (registered)', {
                userId: ctx.user?.id,
                ip: ctx.ip,
            })

            return withFilter(
                () => pubsub.asyncIterator<UserCreatedPayload>('USER_DELETED'),
                (payload, _variables, ctx) => {
                    return (
                        !!ctx.user &&
                        payload.userUpdated.id === ctx.user?.id ||
                        payload.requireRole.includes(ctx.user.role)
                    )
                }
            )(_parent, _args, ctx)
        }
    }
}
// subscribe: withFilter(
//     () => pubsub.asyncIterator<UserDeletedPayload>('USER_DELETED'),
//     (
//         payload,
//         _variables,
//         ctx
//     ) => {
//         // 🔐 HIER DIE SICHERHEIT
//         // Hinweis: hier muss geprüft werden, dass nur ADMIN Role oder der eigene Nutzer ein Update per Subscribe bekommen!
//         return ctx.user && payload.user === ctx.user?.id || payload.requireRole.includes(ctx.user.role)
//     }
// ),
// resolve: (payload: UserDeletedPayload) => {
//     // 👇 NUR das User-Objekt geht an den Client
//     return payload
// }
// },
// }