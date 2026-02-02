export const typeDefs = /* GraphQL */ `
    type Tab {
        id: ID!
        title: String!
        order: Int!

        groups: [Group!]!

        createdAt: DateTime!
        updatedAt: DateTime
    }

    extend type Query {
        meTabs: [Tab!]!
        tabs: [Tab!]!
        tab(id: ID!): Tab
        tabsPaged(page: DataTablePageInput): TabPage!
        tabsForFilter: [Tab!]!
    }

    extend type Mutation {
        createTab(
            title: String!
            order: Int!
            userId: String
        ): Tab!
        updateTab(
            id: ID!
            title: String!
            order: Int!
            userId: String
        ): Tab!
        updateTabOrder(
            id: ID!
            title: String!
            order: Int!
            userId: String
        ): Tab!
        deleteTab(ids: [ID!]!): DeleteTabsPayload!
    }

    extend type Subscription {
        tabCreated: Tab!
        tabUpdated: Tab!
        tabDeleted: DeleteTabsPayload!
    }

    type TabPage {
        totalRecords: Int!
        items: [Tab!]!
    }

    type DeleteTabsPayload {
        deleted: [Tab!]!
        totalCount: Int!
    }
`
