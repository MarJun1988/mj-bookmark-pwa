import type {Role, Tab} from "../../generated/prisma/client.js";

export type TabCreatedPayload = {
    tabCreated: {
        tab: Tab
        tabId: string
        requireRole: Role
    }
}

export type TabUpdatedPayload = {
    tabUpdated: {
        tab: Tab
        tabId: string
        requireRole: Role
    }
}

export type TabDeletedPayload = {
    tabDeleted: {
        tab: Tab
        totalCount: number,
        tabId: string
        requireRole: Role
    }
}