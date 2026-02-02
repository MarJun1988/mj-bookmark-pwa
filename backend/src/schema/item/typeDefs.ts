export const typeDefs = /* GraphQL */ `
  type Item {
    id: ID!
    type: ItemType!
    title: String
    order: Int!

    url: String
    favicon: String

    groupId: String
    group: Group
    config: JSON
    tags: [Tag!]!

    createdAt: DateTime
    updatedAt: DateTime
  }

  type LinkMetaPreview {
    title: String
    favicon: String
  }

  extend type Query {
    meTabsWithItems: [Tab!]!
    meItems: [Item!]!
    items: [Item!]!
    item(id: ID!): Item
    itemsPaged(page: DataTablePageInput): ItemPage!
    itemsSearch(groupId: ID!, filter: ItemFilterInput): [Item!]!
    previewLinkMeta(url: String!): LinkMetaPreview!
  }

  extend type Mutation {
    createItem(input: CreateItemInput!): Item!

    updateItem(id: ID!, input: UpdateItemInput!): Item!
    deleteItem(ids: [ID!]!): DeleteItemsPayload!
    setItemTags(itemId: ID!, tags: [String!]!): Item!
    refreshAllFavicons(
      force: Boolean = false
      limit: Int
    ): RefreshAllFaviconsPayload!
  }

  extend type Subscription {
    itemCreated: Item!
    itemUpdated: Item!
    itemDeleted: DeleteItemsPayload!
  }

  type ItemPage {
    totalRecords: Int!
    items: [Item!]!
  }

  type DeleteItemsPayload {
    deleted: [Item!]!
    totalCount: Int!
  }

  type RefreshAllFaviconsPayload {
    total: Int!
    success: Int!
    failed: Int!
    failedItems: [FailedFavicon!]!
  }

  type FailedFavicon {
    itemId: ID!
    url: String!
    title: String!
    reason: FaviconFailureReason!
  }
`
