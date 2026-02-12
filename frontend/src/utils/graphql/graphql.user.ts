import gql from "graphql-tag";

// #### Query
// Users
export const QUERY_USER = gql`
  query User($userId: ID!) {
    user(id: $userId) {
      id
      email
      firstName
      lastName
      displayName
      role
      createdAt
      updatedAt
    }
  }
`;
export const QUERY_USERS = gql`
  query Users {
    users {
      id
      email
      firstName
      lastName
      displayName
      role
      createdAt
      updatedAt
    }
  }
`;
export const QUERY_USERS_PAGED = gql`
  query UsersPaged($page: DataTablePageInput) {
    usersPaged(page: $page) {
      totalRecords
      items {
        id
        email
        firstName
        lastName
        displayName
        role
        createdAt
        updatedAt
      }
    }
  }
`;

// #### Mutation
export const MUTATIONEN_CREATE_USER = gql`
  mutation CreateUser(
    $email: Email!
    $password: String!
    $firstName: String!
    $lastName: String!
    $displayName: String
    $role: Role
  ) {
    createUser(
      email: $email
      password: $password
      firstName: $firstName
      lastName: $lastName
      displayName: $displayName
      role: $role
    ) {
      createdAt
      email
      id
      firstName
      lastName
      displayName
      role
    }
  }
`;
export const MUTATIONEN_UPDATE_USER = gql`
  mutation UpdateUser(
    $id: ID!
    $email: Email
    $firstName: String
    $lastName: String
    $displayName: String
    $role: Role
  ) {
    updateUser(
      id: $id
      email: $email
      firstName: $firstName
      lastName: $lastName
      displayName: $displayName
      role: $role
    ) {
      email
      firstName
      lastName
      displayName
      updatedAt
      role
      id
    }
  }
`;
export const MUTATIONEN_UPDATE_USER_PASSWORD = gql`
  mutation UpdateUserPassword(
    $id: ID!
    $oldPassword: String
    $newPassword: String
    $newPasswordReplay: String
  ) {
    updateUserPassword(
      id: $id
      oldPassword: $oldPassword
      newPassword: $newPassword
      newPasswordReplay: $newPasswordReplay
    ) {
      id
      email
    }
  }
`;

export const MUTATIONEN_DELETE_USER = gql`
    mutation DeleteUsers($ids: [ID!]!) {
        deleteUsers(ids: $ids) {
            totalCount
            usersDeleted {
                id
                email
            }
        }
    }
`

// Subscription
export const SUBSCRIPTION_USER_CREATED = gql`
  subscription UserCreated {
    userCreated {
      id
      email
      firstName
      lastName
      displayName
      role
      createdAt
      updatedAt
    }
  }
`;
export const SUBSCRIPTION_USER_UPDATED = gql`
  subscription UserUpdated {
    userUpdated {
      id
      email
      firstName
      lastName
      displayName
      role
      createdAt
      updatedAt
    }
  }
`;
export const SUBSCRIPTION_USER_DELETED = gql`
  subscription UserDeleted {
    userDeleted {
      user {
        id
        firstName
        lastName
        displayName
      }
      totalCount
    }
  }
`;
