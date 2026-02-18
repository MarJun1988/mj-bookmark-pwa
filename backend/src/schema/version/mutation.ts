import { requireAuth } from "../../auth/requireAuth.js";
import type { Context } from "../../types/types.js";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import { GraphQLError } from "graphql/index.js";
import { Role } from "../../generated/prisma/enums.js";

export const Mutation = {
  createVersion: async (_: unknown, args: any, ctx: Context) => {
    requireAuth(ctx, ["ADMIN"]);

    const version = await ctx.prisma.version.create({ data: args });
    await ctx.pubsub.publish("VERSION_CREATED", {
      versionCreated: version,
    });

    return version;
  },

  updateVersion: async (_: unknown, args: any, ctx: Context) => {
    requireAuth(ctx, ["ADMIN"]);

    try {
      const versionUpdated = await ctx.prisma.version.update({
        where: { id: args.id },
        data: {
          versionNumber: args.versionNumber,
          description: args.description,
          updatedAt: new Date(),
        },
      });

      await ctx.pubsub.publish("VERSION_UPDATED", {
        versionUpdated,
        requireRole: [Role.ADMIN],
      });

      return versionUpdated;
    } catch (error: unknown) {
      if (error instanceof PrismaClientKnownRequestError && error.code === "P2025") {
        throw new GraphQLError("Version not found", {
          extensions: { code: "NOT_FOUND" },
        });
      }

      throw error;
    }
  },

  deleteVersion: async (_: unknown, { ids }: { ids: string[] }, ctx: Context) => {
    requireAuth(ctx, ["ADMIN"]);

    try {
      const versions = await ctx.prisma.version.findMany({
        where: { id: { in: ids } },
      });

      await ctx.prisma.version.deleteMany({
        where: { id: { in: ids } },
      });

      const totalCount = await ctx.prisma.version.count();

      for (const v of versions) {
        await ctx.pubsub.publish("VERSION_DELETED", {
          versionDeleted: { deleted: [v], totalCount },
          requireRole: [Role.ADMIN],
        });
      }

      return { deleted: versions, totalCount };
    } catch (error: unknown) {
      if (error instanceof PrismaClientKnownRequestError && error.code === "P2025") {
        throw new GraphQLError("Version not found", {
          extensions: { code: "NOT_FOUND" },
        });
      }

      throw error;
    }
  },
};
