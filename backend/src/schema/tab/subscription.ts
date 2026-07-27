import { withFilter } from "graphql-subscriptions";
import { pubsub } from "../../pubsub.js";
import type { GraphQLContext } from "../../types/types.js";
import type { TabCreatedPayload, TabDeletedPayload, TabUpdatedPayload } from "./types.js";

export const Subscription = {
  tabCreated: {
    subscribe: (_parent: unknown, _args: unknown, ctx: GraphQLContext) => {
      console.log("📡 SUBSCRIBE tabCreated (registered)", {
        userId: ctx.user?.id,
        ip: ctx.ip,
      });

      return withFilter(
        () => pubsub.asyncIterator<TabCreatedPayload>("TAB_CREATED"),
        (payload, _variables, ctx) => {
          console.log("TAB_CREATED - subscribe", payload.tabCreated.tab, ctx.user);

          return !!ctx.user && payload.tabCreated.userId === ctx.user?.id;
        },
      )(_parent, _args, ctx);
    },
  },
  tabUpdated: {
    subscribe: (_parent: unknown, _args: unknown, ctx: GraphQLContext) => {
      console.log("📡 SUBSCRIBE tabUpdated (registered)", {
        userId: ctx.user?.id,
        ip: ctx.ip,
      });

      return withFilter(
        () => pubsub.asyncIterator<TabUpdatedPayload>("TAB_UPDATED"),
        (payload, _variables, ctx) => {
          console.log("TAB_UPDATED", payload);
          return !!ctx.user && payload.tabUpdated.userId === ctx.user?.id;
        },
      )(_parent, _args, ctx);
    },

    // subscribe: withFilter(
    //     () => pubsub.asyncIterator<TabUpdatedPayload>('TAB_UPDATED'),
    //     (payload, _variables, ctx) => {
    //         // 🔐 SERVERSEITIGER FILTER
    //         return payload.tabUpdated.userId === ctx.user?.id
    //     }
    // ),
    // resolve: (payload: TabUpdatedPayload) => {
    //     // 🔥 HIER DER FIX
    //     return payload.tabUpdated.tab
    // }
  },
  tabDeleted: {
    subscribe: (_parent: unknown, _args: unknown, ctx: GraphQLContext) => {
      console.log("📡 SUBSCRIBE tabDeleted (registered)", {
        userId: ctx.user?.id,
        ip: ctx.ip,
      });

      return withFilter(
        () => pubsub.asyncIterator<TabDeletedPayload>("TAB_DELETED"),
        (payload, _variables, ctx) => {
          console.log("TAB_DELETED", payload.tabDeleted);
          return !!ctx.user && payload.tabDeleted.deleted.userId === ctx.user?.id;
        },
      )(_parent, _args, ctx);
    },

    // subscribe: withFilter(
    //     () => pubsub.asyncIterator<TabDeletedPayload>('TAB_DELETED'),
    //     (payload, _variables, ctx) => {
    //         // 🔐 SERVERSEITIGER FILTER
    //         return payload.tabDeleted.userId === ctx.user?.id
    //     }
    // ),
    // resolve: (payload: TabDeletedPayload) => {
    //     // 🔥 HIER DER FIX
    //     return payload.tabDeleted.tab
    // }
  },
};
