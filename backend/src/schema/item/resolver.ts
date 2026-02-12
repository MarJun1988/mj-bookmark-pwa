import type {Context} from "../../types/types.js";

export const Item = {
    tags: async (parent: { id: string }, _: unknown, ctx: Context) => {
        const itemTags = await ctx.prisma.itemTag.findMany({
            where: { itemId: parent.id },
            include: { tag: true }
        })

        return itemTags.map((it) => it.tag)
    }
}