export const typeDefs = /* GraphQL */ `
  type AuthPayload {
    accessToken: String!
    refreshToken: String!
    user: User!
  }

  type AuthPayloadRefresh {
    accessToken: String!
    user: User!
  }

  type RegisterPayload {
    user: User!
  }

  extend type Mutation {
    login(email: Email!, password: String!): AuthPayload!
    logout: Boolean!
    refreshToken: AuthPayloadRefresh!
    bootstrapAdmin(
      email: Email!
      password: String!
      lastName: String!
      firstName: String!
      displayName: String
    ): AuthPayload!

    createDashboardForUser(userId: ID!, tabs: [CreateTabInput2!]!): User!

    registerUser(
      email: Email!
      password: String!
      passwordReplay: String!
      firstName: String!
      lastName: String!
      displayName: String
    ): RegisterPayload!

    verifyEmail(token: String!): Boolean!

    requestPasswordReset(email: Email!): Boolean!
    resetPassword(
      token: String!
      newPassword: String!
      newPasswordReplay: String!
    ): Boolean!
  }
`