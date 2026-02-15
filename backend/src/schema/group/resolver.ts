import type { Context } from "../../types/types.js";

export const Group = {
  items: (parent: { id: string }, _: unknown, ctx: Context) => {
    return ctx.prisma.item.findMany({
      where: { groupId: parent.id },
      orderBy: { order: "asc" },
    });
  },
};
