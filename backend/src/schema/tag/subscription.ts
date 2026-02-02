import {withFilter} from "graphql-subscriptions";
import {pubsub} from "../../pubsub.js";
import type {TagCreatedPayload, TagDeletedPayload, TagUpdatedPayload} from "./types.js";

export const Subscription = {
    tagCreated: {
        subscribe: withFilter(
            () => pubsub.asyncIterator<TagCreatedPayload>('TAG_CREATED'),
            (
                payload,
                _variables,
                ctx
            ) => {
                // 🔐 HIER DIE SICHERHEIT
                return payload.tagCreated.userId === ctx.user?.id
            }
        ),
        resolve: (payload: TagCreatedPayload) => {
            // 👇 NUR das Group-Objekt geht an den Client
            return payload.tagCreated
        }
    },
    tagUpdated: {
        subscribe: withFilter(
            () => pubsub.asyncIterator<TagUpdatedPayload>('TAG_UPDATED'),
            (
                payload,
                _variables,
                ctx
            ) => {
                // 🔐 HIER DIE SICHERHEIT
                return payload.tagUpdated.userId === ctx.user?.id
            }
        ),
        resolve: (payload: TagUpdatedPayload) => {
            // 👇 NUR das Group-Objekt geht an den Client
            return payload.tagUpdated
        }
    },
    tagDeleted: {
        subscribe: withFilter(
            () => pubsub.asyncIterator<TagDeletedPayload>('TAG_DELETED'),
            (
                payload,
                _variables,
                ctx
            ) => {
                // 🔐 HIER DIE SICHERHEIT
                return payload.tagDeleted.userId === ctx.user?.id
            }
        ),
        resolve: (payload: TagDeletedPayload) => {
            // 👇 NUR das Group-Objekt geht an den Client
            return payload.tagDeleted
        }
    },
}
