import gql from 'graphql-tag'

// #### Query
// Tabs
export const QUERY_ME_ITEMS = gql`
    query MeItems {
        meItems {
            id
            type
            title
            order
            url
            favicon
            groupId
            group {
                id
                title
            }
            config
            tags {
                id
                name
                slug
            }
            createdAt
            updatedAt
        }
    }`
export const QUERY_ITEM = gql`
    query Item($itemId: ID!) {
        item(id: $itemId) {
            id
            type
            title
            order
            url
            favicon
            groupId
            group {
                id
                title
                tabId
            }
            config
            tags {
                id
                name
                slug
            }
            createdAt
            updatedAt
        }
    }
`
export const QUERY_ITEMS = gql`
    query Items {
        items {
            id
            type
            title
            order
            url
            groupId
            group {
                id
                title
            }
            config
            tags {
                id
                name
                slug
            }
            createdAt
            updatedAt
        }
    }
`
export const QUERY_ITEM_PREVIEW_LINK_META = gql`
    query PreviewLinkMeta($url: String!) {
        previewLinkMeta(url: $url) {
            url
            title
            favicon
        }
    }
`
export const QUERY_ITEMS_PAGED = gql`
    query ItemsPaged($page: DataTablePageInput) {
        itemsPaged(page: $page) {
            totalRecords
            items {
                id
                type
                title
                order
                url
                favicon
                groupId
                group {
                    id
                    title
                    tab {
                        id
                        title
                    }
                }
                config
                tags {
                    id
                    name
                    slug
                }
                createdAt
                updatedAt
            }
        }
    }
`

// #### Mutation
export const MUTATIONEN_CREATE_ITEM = gql`
    mutation CreateItem($input: CreateItemInput!) {
        createItem(input: $input) {
            id
            type
            title
            order
            url
            favicon
            groupId
            group {
                id
                title
            }
            config
            tags {
                id
                name
                slug
            }
            createdAt
            updatedAt
        }
    }
`
export const MUTATIONEN_UPDATE_ITEM = gql`
    mutation UpdateItem($id: ID!, $input: UpdateItemInput!) {
        updateItem(id: $id, input: $input) {
            id
            type
            title
            order
            url
            favicon
            groupId
            group {
                id
                title
                tab {
                    id
                    title
                }
            }
            config
            tags {
                id
                name
                slug
            }
            createdAt
            updatedAt
        }
    }
`
export const MUTATIONEN_UPDATE_ITEM_ORDER = gql`
    mutation UpdateTabOrder($id: ID!, $title: String!, $order: Int!) {
        updateTabOrder(id:$id, title: $title, order: $order) {
            id
            order
        }
    }
`
export const MUTATIONEN_DELETE_ITEM = gql`
    mutation DeleteItem($ids: [ID!]!) {
        deleteItem(ids: $ids) {
            deleted {
                id
                title
            }
            totalCount
        }
    }
`

export const MUTATIONEN_REFRESH_ALL_FAVICONS = gql`
    mutation RefreshAllFavicons($force: Boolean, $limit: Int) {
    refreshAllFavicons(force: $force, limit: $limit) {
            total
            success
            failed
            failedItems {
            title
            url
            reason
            }
        }
    }
`

// Subscription
export const SUBSCRIPTION_ITEM_CREATED = gql`
    subscription ItemCreated {
        itemCreated {
            id
            type
            title
            order
            url
            groupId
            group {
                id
                title
            }
            config
            tags {
                id
                name
                slug
            }
            createdAt
            updatedAt
        }
    }
`
export const SUBSCRIPTION_ITEM_UPDATED = gql`
    subscription ItemUpdated {
        itemUpdated {
            id
            type
            title
            order
            url
            groupId
            group {
                id
                title
            }
            config
            tags {
                id
                name
                slug
            }
            createdAt
            updatedAt
        }
    }
`
export const SUBSCRIPTION_ITEM_DELETED = gql`
    subscription ItemDeleted {
        itemDeleted {
            deleted {
                id
                title
                groupId
            }
            totalCount
        }
    }
`
