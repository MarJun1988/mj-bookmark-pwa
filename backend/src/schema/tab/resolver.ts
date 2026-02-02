import type {Context} from "node:vm";

export const Tab = {
    groups: (parent: { id: string }, _: unknown, ctx: Context) => {
        return ctx.prisma.group.findMany({
            where: { tabId: parent.id },
            orderBy: { order: 'asc' }
        })
    }
}