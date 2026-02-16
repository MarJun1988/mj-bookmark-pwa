import gql from "graphql-tag";

// #### Query
// Tabs
export const QUERY_ME_TABS = gql`
  query MeTabs {
    meTabs {
      id
      title
      order
      groups {
        id
      }
      createdAt
      updatedAt
    }
  }
`;
export const QUERY_TAB = gql`
  query Tab($tabId: ID!) {
    tab(id: $tabId) {
      id
      title
      order
      groups {
        id
        items {
          id
        }
      }
      createdAt
      updatedAt
    }
  }
`;
export const QUERY_TABS = gql`
  query Tabs {
    tabs {
      id
      title
      order
      groups {
        id
      }
    }
  }
`;
export const QUERY_ME_TABS_FOR_FILTER = gql`
  query TabsForFilter {
    tabsForFilter {
      id
      title
    }
  }
`;
export const QUERY_TABS_PAGED = gql`
  query Tab($page: DataTablePageInput) {
    tabsPaged(page: $page) {
      totalRecords
      items {
        id
        order
        title
        createdAt
        updatedAt
      }
    }
  }
`;

// #### Mutation
export const MUTATIONEN_CREATE_TAB = gql`
  mutation CreateTab($title: String!, $order: Int!) {
    createTab(title: $title, order: $order) {
      id
      title
      order
    }
  }
`;
export const MUTATIONEN_UPDATE_TAB = gql`
  mutation UpdateTab($id: ID!, $title: String!, $order: Int!) {
    updateTab(id: $id, title: $title, order: $order) {
      id
      order
      title
    }
  }
`;
export const MUTATIONEN_UPDATE_TAB_ORDER = gql`
  mutation UpdateTabOrder($id: ID!, $title: String!, $order: Int!) {
    updateTabOrder(id: $id, title: $title, order: $order) {
      id
      order
    }
  }
`;

export const MUTATIONEN_DELETE_TAB = gql`
  mutation DeleteTab($ids: [ID!]!) {
    deleteTab(ids: $ids) {
      deleted {
        id
        title
      }
      totalCount
    }
  }
`;

// Subscription
export const SUBSCRIPTION_TAB_CREATED = gql`
  subscription TabCreated {
    tabCreated {
      id
      order
      title
    }
  }
`;
export const SUBSCRIPTION_TAB_UPDATED = gql`
  subscription TabUpdated {
    tabUpdated {
      title
      order
      id
    }
  }
`;
export const SUBSCRIPTION_TAB_DELETED = gql`
  subscription TabDeleted {
    tabDeleted {
      totalCount
      deleted {
        id
        title
      }
    }
  }
`;
