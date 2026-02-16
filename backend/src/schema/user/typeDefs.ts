export const typeDefs = /* GraphQL */ `
  type User {
    id: ID!
    email: Email!
    firstName: String!
    lastName: String!
    displayName: String
    role: Role!
    createdAt: DateTime!
    updatedAt: DateTime
    emailVerified: Boolean!

    emailVerifications: [EmailVerification!]! # ✅ Relation als Liste
    tabs: [Tab!]!
  }

  type ExportBookmarksPayload {
    version: String!
    exportedAt: DateTime!
    app: String!
    data: JSON!
  }

  extend type Query {
    me: User
    users: [User!]!
    user(id: ID!): User
    usersPaged(page: DataTablePageInput): UserPage!
    exportBookmarks: ExportBookmarksPayload!
  }

  enum ImportMode {
    APPEND
    REPLACE
  }

  input ImportBookmarksInput {
    json: String!
    mode: ImportMode!
  }

  type ImportBookmarksResult {
    importedTabs: Int!
    importedGroups: Int!
    importedItems: Int!
    skippedItems: Int!
    createdTags: Int!
  }

  extend type Mutation {
    createUser(
      email: Email!
      password: String!
      firstName: String!
      lastName: String!
      displayName: String
      role: Role
    ): User!

    updateUser(
      id: ID!
      email: Email
      password: String
      firstName: String
      lastName: String
      displayName: String
      role: Role
    ): User!

    updateUserPassword(
      id: ID!
      oldPassword: String
      newPassword: String
      newPasswordReplay: String
    ): User!

    deleteUsers(ids: [ID!]!): DeleteUsersPayload!
    
    importBookmarks(input: ImportBookmarksInput!): ImportBookmarksResult!
  }

  extend type Subscription {
    userCreated: User!
    userUpdated: User!
    userDeleted: DeleteUsersPayloadSub!
  }

  type UserPage {
    totalRecords: Int!
    items: [User!]!
  }

  type DeleteUsersPayload {
    usersDeleted: [User!]!
    totalCount: Int!
  }

  type DeleteUsersPayloadSub {
    user: User!
    totalCount: Int!
  }

  type EmailVerification {
    id: ID!
    token: String!
    userId: String!
    expiresAt: DateTime!
    user: User
  }
`
