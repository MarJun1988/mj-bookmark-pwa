import gql from 'graphql-tag'

// #### Query
// Tabs
export const QUERY_ME_GROUPS = gql`
    query MeGroups {
        meGroups {
            id
            title
            order
            tabId
            createdAt
            updatedAt
        }
    }`
export const QUERY_GROUP = gql`
    query Group($groupId: ID!) {
        group(id: $groupId) {
            id
            title
            order
            tabId
            tab {
                id
                title
            }
            items {
                id
            }
            createdAt
            updatedAt
        }
    }
`
export const QUERY_GROUPS = gql`
    query Groups {
        groups {
            id
            title
            order
            tabId
            tab {
                id
                title
            }
            items {
                id
            }
        }
    }
`
export const QUERY_ME_GROUPS_FOR_FILTER = gql`
    query GroupsForFilter {
        groupsForFilter {
            id
            title
        }
    }
`
export const QUERY_GROUPS_PAGED = gql`
    query GroupsPaged($page: DataTablePageInput) {
        groupsPaged(page: $page) {
            totalRecords
            items {
                id
                title
                order
                tabId
                tab {
                    id
                    title
                }
                items {
                    id
                }
                createdAt
                updatedAt
            }
        }
    }
`

// #### Mutation
export const MUTATIONEN_CREATE_GROUP = gql`
    mutation CreateGroup($title: String!, $order: Int!, $tabId: String!) {
        createGroup(title: $title, order: $order, tabId: $tabId) {
            id
            order
            title
            tabId
            tab {
                id
                title
            }
        }
    }
`
export const MUTATIONEN_UPDATE_GROUP = gql`
    mutation UpdateGroup($id: ID!, $title: String!, $order: Int!, $tabId: String!) {
        updateGroup(id: $id, title: $title, order: $order, tabId: $tabId) {
            id
            title
            order
            tabId
            tab {
                id
                title
            }
        }
    }
`
export const MUTATIONEN_UPDATE_GROUP_ORDER = gql`
    mutation UpdateTabOrder($id: ID!, $title: String!, $order: Int!) {
        updateTabOrder(id:$id, title: $title, order: $order) {
            id
            order
        }
    }
`
export const MUTATIONEN_DELETE_GROUP = gql`
    mutation DeleteGroup($ids: [ID!]!) {
        deleteGroup(ids: $ids) {
            deleted {
                id
                title
                tabId
                tab {
                    id
                    title
                }
            }
            totalCount
        }
    }
`

// Subscription
export const SUBSCRIPTION_GROUP_CREATED = gql`
    subscription GroupCreated {
        groupCreated {
            id
            title
            order
            tabId
            tab {
                id
                title
            }
        }
    }
`
export const SUBSCRIPTION_GROUP_UPDATED = gql`
    subscription GroupUpdated {
        groupUpdated {
            id
            title
            order
            tabId
            tab {
                id
                title
            }
            items {
                id
            }
        }
    }
`
export const SUBSCRIPTION_GROUP_DELETED = gql`
    subscription GroupDeleted {
        groupDeleted {
            deleted {
                id
                title
                tabId
            }
            totalCount
        }
    }
`
