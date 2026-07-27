import type { Context } from "../../types/types.js";

export const User = {
  tabs: async (parent: { id: string }, _: unknown, ctx: Context) => {
    return ctx.prisma.tab.findMany({
      where: { userId: parent.id },
      orderBy: { order: "asc" },
    });
  },
};
