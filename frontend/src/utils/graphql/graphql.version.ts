import gql from 'graphql-tag'

// #### Query
// Users
export const QUERY_VERSION = gql`
    query Version($versionId: ID!) {
        version(id: $versionId) {
            id
            versionNumber
            description
            createdAt
            updatedAt
        }
    }
`
export const QUERY_VERSIONS = gql`
    query Versions {
        versions {
            id
            versionNumber
            description
            createdAt
            updatedAt
        }
    }
`
export const QUERY_VERSIONS_PAGED = gql`
    query VersionsPaged($page: DataTablePageInput) {
        versionsPaged(page: $page) {
            totalRecords
            items {
                id
                versionNumber
                description
                createdAt
                updatedAt
            }
        }
    }
`

// #### Mutation
export const MUTATIONEN_CREATE_VERSION = gql`
    mutation CreateUser($email: Email!, $password: String!, $name: String, $role: Role) {
        createUser(email: $email, password: $password, name: $name, role: $role) {
            createdAt
            email
            id
            name
            role
        }
    }
`
export const MUTATIONEN_UPDATE_VERSION = gql`
    mutation UpdateUser($id: ID!, $email: Email, $name: String, $role: Role) {
        updateUser(id: $id, email: $email, name: $name, role: $role) {
            email
            name
            updatedAt
            role
            id
        }
    }
`
export const MUTATIONEN_UPDATE_VERSION_PASSWORD = gql`
    mutation UpdateUser($id: ID!, $password: String) {
        updateUser(id: $id, password: $password) {
            updatedAt
            id
        }
    }
`

export const MUTATIONEN_DELETE_VERSION = gql`
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
export const SUBSCRIPTION_VERSION_CREATED = gql`
    subscription VersionCreated {
        versionCreated {
            id
            versionNumber
            description
            createdAt
            updatedAt
        }
    }
`
export const SUBSCRIPTION_VERSION_UPDATED = gql`
    subscription VersionUpdated {
        versionUpdated {
            id
            versionNumber
            description
            createdAt
            updatedAt
        }
    }
`
export const SUBSCRIPTION_VERSION_DELETED = gql`
    subscription VersionDeleted {
        versionDeleted {
            deleted {
                id
                versionNumber
            }
            totalCount
        }
    }
`
