export const typeDefs = /* GraphQL */ `
    type Group {
        id: ID!
        title: String!
        order: Int!
        tabId: String!
        tab: Tab
        items: [Item!]!

        createdAt: DateTime!
        updatedAt: DateTime
    }

    extend type Query {
        meGroups: [Group!]!
        groups: [Group!]!
        group(id: ID!): Group
        groupsPaged(page: DataTablePageInput): GroupPage!
        groupsForFilter: [Group!]!
    }

    extend type Mutation {
        createGroup(
            title: String!
            order: Int!
            tabId: String!
        ): Group!
        updateGroup(
            id: ID!
            title: String!
            order: Int!
            tabId: String!
        ): Group!
        deleteGroup(ids: [ID!]!): DeleteGroupsPayload!
    }

    extend type Subscription {
        groupCreated: Group!
        groupUpdated: Group!
        groupDeleted: DeleteGroupsPayload!
    }

    type GroupPage {
        totalRecords: Int!
        items: [Group!]!
    }

    type DeleteGroupsPayload {
        deleted: [Group!]!
        totalCount: Int!
    }
`
