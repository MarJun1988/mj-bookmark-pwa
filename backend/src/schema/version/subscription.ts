import type { GraphQLContext } from "../../types/types.js";
import { withFilter } from "graphql-subscriptions";
import { pubsub } from "../../pubsub.js";
import type { versionDeletedPayload, versionUpdatedPayload } from "./types.js";

class VersionCreatedPayload {}

export const Subscription = {
  versionCreated: {
    subscribe: (_parent: unknown, _args: unknown, ctx: GraphQLContext) => {
      console.log("📡 SUBSCRIBE versionCreated (registered)", {
        userId: ctx.user?.id,
        ip: ctx.ip,
      });

      return withFilter(
        () => pubsub.asyncIterator<VersionCreatedPayload>("VERSION_CREATED"),
        (payload, _variables, ctx) => {
          return !!ctx.user && payload.requireRole.includes(ctx.user.role);
        },
      )(_parent, _args, ctx);
    },

    //
    // subscribe: (_: unknown, __: unknown, ctx: any) =>
    //     ctx.pubsub.asyncIterator(['VERSION_CREATED']),
  },

  versionUpdated: {
    subscribe: (_parent: unknown, _args: unknown, ctx: GraphQLContext) => {
      console.log("📡 SUBSCRIBE versionUpdated (registered)", {
        userId: ctx.user?.id,
        ip: ctx.ip,
      });

      return withFilter(
        () => pubsub.asyncIterator<versionUpdatedPayload>("VERSION_UPDATED"),
        (payload, _variables, ctx) => {
          return !!ctx.user && payload.requireRole.includes(ctx.user.role);
        },
      )(_parent, _args, ctx);
    },

    // subscribe: (_: unknown, __: unknown, ctx: any) =>
    //     ctx.pubsub.asyncIterator(['VERSION_UPDATED']),
  },

  versionDeleted: {
    subscribe: (_parent: unknown, _args: unknown, ctx: GraphQLContext) => {
      console.log("📡 SUBSCRIBE versionDeleted (registered)", {
        userId: ctx.user?.id,
        ip: ctx.ip,
      });

      return withFilter(
        () => pubsub.asyncIterator<versionDeletedPayload>("VERSION_DELETED"),
        (payload, _variables, ctx) => {
          return !!ctx.user && payload.requireRole.includes(ctx.user.role);
        },
      )(_parent, _args, ctx);
    },
    //
    //
    // subscribe: (_: unknown, __: unknown, ctx: any) =>
    //     ctx.pubsub.asyncIterator(['VERSION_DELETED']),
  },
};
