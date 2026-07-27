export const typeDefs = /* GraphQL */ `
  type Version {
    id: ID!
    versionNumber: String!
    description: String!
    createdAt: DateTime!
    updatedAt: DateTime
  }

  extend type Query {
    versions: [Version!]!
    version(id: ID!): Version
    versionsPaged(page: DataTablePageInput): VersionPage!
  }

  extend type Mutation {
    createVersion(
      versionNumber: String!
      description: String!
    ): Version!
    updateVersion(
      id: ID!
      versionNumber: String!
      description: String!
    ): Version!
    deleteVersion(ids: [ID!]!): DeleteVersionsPayload!
  }

  extend type Subscription {
    versionCreated: Version!
    versionUpdated: Version!
    versionDeleted: DeleteVersionsPayload!
  }

  type VersionPage {
    totalRecords: Int!
    items: [Version!]!
  }

  type DeleteVersionsPayload {
    deleted: [Version!]!
    totalCount: Int!
  }
`
