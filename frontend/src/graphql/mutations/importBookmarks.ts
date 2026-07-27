import { gql } from "@apollo/client";

export const IMPORT_BOOKMARKS = gql`
  mutation ImportBookmarks($input: ImportBookmarksInput!) {
    importBookmarks(input: $input) {
      importedTabs
      importedGroups
      importedItems
      skippedItems
      createdTags
    }
  }
`;
