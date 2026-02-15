import { GraphQLError } from "graphql";
import type { Context } from "../types/types.js";
import type { Role } from "../generated/prisma/enums.js";

export function requireAuth(ctx: Context, roles?: [Role]) {
  if (!ctx.user) {
    throw new GraphQLError("Not authenticated", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }

  if (roles && !roles.includes(ctx.user.role)) {
    throw new GraphQLError("Not authorized", {
      extensions: { code: "FORBIDDEN" },
    });
  }

  return ctx.user;
}
