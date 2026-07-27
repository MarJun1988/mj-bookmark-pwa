import { prisma } from "../../lib/prisma.js";
import { requireAuth } from "../../auth/requireAuth.js";
import { GraphQLError } from "graphql";
import type { Context } from "../../types/types.js";
import { Prisma } from "@prisma/client/extension";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import type { Tab } from "../../generated/prisma/client.js";

export const Mutation = {
  createTab: async (_: unknown, args: any, ctx: Context) => {
    requireAuth(ctx);

    if (!args.title?.trim()) {
      throw new GraphQLError("Title is required");
    }

    const tab = await ctx.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 🔢 Reihenfolge automatisch bestimmen
      const lastTab = await tx.tab.findFirst({
        where: { userId: ctx.user!.id },
        orderBy: { order: "desc" },
        select: { order: true },
      });

      const order = args && args.order ? args.order : (lastTab?.order ?? 0) + 1;

      return tx.tab.create({
        data: {
          userId: ctx.user!.id,
          title: args.title.trim(),
          order,
        },
      });
    });

    if (ctx && ctx.user && ctx.user.id) {
      // 📣 PubSub **AUSSERHALB** der Transaction
      console.log("TAB_CREATED - createTab");

      await ctx.pubsub.publish("TAB_CREATED", {
        tabCreated: tab,
        userId: ctx.user.id,
      });
    }

    return await tab;
  },
  updateTab: async (_: unknown, args: any, ctx: Context) => {
    requireAuth(ctx);

    const tab: Tab | null = await ctx.prisma.tab.findUnique({
      where: { id: args.id },
    });

    if (!tab || tab.userId !== ctx.user!.id) {
      throw new GraphQLError("Tab not found");
    }
    try {
      const tabUpdated = await ctx.prisma.tab.update({
        where: { id: args.id, userId: ctx.user!.id },
        data: {
          title: args.title?.trim() ?? undefined,
          order: args.order ?? undefined,
          updatedAt: new Date(),
        },
      });

      if (ctx && ctx.user && ctx.user.id) {
        await ctx.pubsub.publish("TAB_UPDATED", {
          tabUpdated,
          userId: ctx.user.id,
        });
      }
      return tabUpdated;
    } catch (error: unknown) {
      if (error instanceof PrismaClientKnownRequestError && error.code === "P2025") {
        throw new GraphQLError("Tab not found", {
          extensions: { code: "NOT_FOUND" },
        });
      }

      throw error;
    }
  },
  updateTabOrder: async (_: unknown, args: any, ctx: Context) => {
    requireAuth(ctx);

    const tab = await ctx.prisma.tab.findUnique({
      where: { id: args.id },
    });

    if (!tab || tab.userId !== ctx.user!.id) {
      throw new GraphQLError("Tab not found");
    }
    try {
      const tabUpdated = await ctx.prisma.tab.update({
        where: { id: args.id, userId: ctx.user!.id },
        data: {
          order: args.order ?? undefined,
          updatedAt: new Date(),
        },
      });

      if (ctx && ctx.user && ctx.user.id) {
        await ctx.pubsub.publish("TAB_UPDATED", {
          tabUpdated,
          userId: ctx.user.id,
        });
      }
      return tabUpdated;
    } catch (error: unknown) {
      if (error instanceof PrismaClientKnownRequestError && error.code === "P2025") {
        throw new GraphQLError("Tab not found", {
          extensions: { code: "NOT_FOUND" },
        });
      }

      throw error;
    }
  },
  deleteTab: async (_: unknown, { ids }: { ids: string[] }, ctx: Context) => {
    requireAuth(ctx);

    console.log(`TAB_DELETED - deleteTab`);

    try {
      const tabs = await prisma.tab.findMany({
        where: { id: { in: ids }, userId: ctx.user!.id },
      });

      await prisma.tab.deleteMany({
        where: { id: { in: ids } },
      });

      const totalCount = await prisma.tab.count({
        where: { userId: ctx.user!.id },
      });

      if (ctx && ctx.user && ctx.user.id) {
        for (const v of tabs) {
          await ctx.pubsub.publish("TAB_DELETED", {
            tabDeleted: {
              deleted: [v],
              totalCount,
            },
            userId: ctx.user.id,
          });
        }

        return { deleted: tabs, totalCount };
      }
    } catch (error: unknown) {
      if (error instanceof PrismaClientKnownRequestError && error.code === "P2025") {
        throw new GraphQLError("Tab not found", {
          extensions: { code: "NOT_FOUND" },
        });
      }

      throw error;
    }
  },
};
