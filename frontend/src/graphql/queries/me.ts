import { gql } from "@apollo/client";

export const ME_QUERY = gql`
  query Me {
    me {
      id
      email
      role
      lastName
      firstName
      displayName
      tabs {
        id
        title
        order
        groups {
          id
          title
          order
          tabId
          items {
            order
            groupId
            id
            title
            type
            url
            config
            favicon
            tags {
              id
              name
              slug
            }
          }
        }
      }
    }
  }
`;


export const EXPORT_BOOKMARKS = gql`
  query ExportBookmarks {
    exportBookmarks {
      version
      exportedAt
      app
      data
    }
  }
`;