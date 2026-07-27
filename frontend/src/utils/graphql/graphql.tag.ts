import gql from "graphql-tag";

// #### Query
// Tags
export const QUERY_TAG = gql`
  query Tag($tagId: ID!) {
    tag(id: $tagId) {
      id
      name
      slug
      createdAt
      updatedAt
    }
  }
`;
export const QUERY_TAGS = gql`
  query Tags {
    tags {
      id
      name
      slug
    }
  }
`;
export const QUERY_TAGS_FOR_FILTER = gql`
  query TagsForFilter {
    tagsForFilter {
      id
      name
      slug
    }
  }
`;
export const QUERY_TAGS_PAGED = gql`
  query TagsPaged($page: DataTablePageInput) {
    tagsPaged(page: $page) {
      totalRecords
      tags {
        id
        name
        slug
        createdAt
        updatedAt
      }
    }
  }
`;

export const QUERY_TAGS_SEARCH = gql`
  query TagsSearchAutocomplete($query: String, $limit: Int) {
    tagsSearchAutocomplete(query: $query, limit: $limit) {
      id
      name
      slug
    }
  }
`;

// #### Mutation
export const MUTATIONEN_CREATE_TAG = gql`
  mutation CreateTag($name: String!, $slug: String!) {
    createTag(name: $name, slug: $slug) {
      id
      name
      slug
    }
  }
`;
export const MUTATIONEN_UPDATE_TAG = gql`
  mutation UpdateTag($id: ID!, $name: String!, $slug: String!) {
    updateTag(id: $id, name: $name, slug: $slug) {
      id
      name
      slug
    }
  }
`;
export const MUTATIONEN_DELETE_TAG = gql`
  mutation DeleteTag($ids: [ID!]!) {
    deleteTag(ids: $ids) {
      deleted {
        id
        name
        slug
      }
      totalCount
    }
  }
`;

// Subscription
export const SUBSCRIPTION_TAG_CREATED = gql`
  subscription TagCreated {
    tagCreated {
      id
      name
      slug
    }
  }
`;
export const SUBSCRIPTION_TAG_UPDATED = gql`
  subscription TagUpdated {
    tagUpdated {
      id
      name
      slug
    }
  }
`;
export const SUBSCRIPTION_TAG_DELETED = gql`
  subscription TagDeleted {
    tagDeleted {
      deleted {
        id
        name
        slug
      }
      totalCount
    }
  }
`;
