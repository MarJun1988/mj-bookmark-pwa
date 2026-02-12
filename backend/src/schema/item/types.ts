import type {Item, Role} from "../../generated/prisma/client.js";

export type ItemCreatedPayload = {
    itemCreated: {
        item: Item
        userId: string
        requireRole: Role
    }
}

export type ItemUpdatedPayload = {
    itemUpdated: {
        item: Item
        userId: string
        requireRole: Role
    }
}

export type ItemDeletedPayload = {
    itemDeleted: {
        item: Item
        userId: string
        requireRole: Role
    }
}