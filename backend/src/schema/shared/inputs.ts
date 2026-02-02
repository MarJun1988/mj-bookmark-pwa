export const inputs = /* GraphQL */ `
    # 🔽 Input-Typ für PrimeVue DataTable Lazy Loading
    input DataTablePageInput {
        first: Int
        rows: Int
        page: Int
        pageCount: Int
        sortField: String
        sortOrder: Int
        multiSortMeta: [SortMetaInput]
        filters: JSON
        originalEvent: JSON
        #        first: Int          # Startindex
        #        rows: Int           # Anzahl Zeilen pro Seite
        #        sortField: String   # Einzelfeldsortierung
        #        sortOrder: Int      # 1 = ASC, -1 = DESC
        #        multiSortMeta: [SortMetaInput] # für Multi-Sortierung
        #        filters: JSON       # komplexe Filterstruktur
    }


    # 🔽 Multi-Sort-Input (wie PrimeVue multiSortMeta)
    input SortMetaInput {
        field: String!
        order: Int!
    }

    input ItemFilterInput {
        text: String
        tagSlugs: [String!]
    }

    input CreateItemInput {
        groupId: String
        title: String
        order: Int!

        type: ItemType
        url: String
        config: JSON

        tagIds: [ID]
#        tags: [String]
    }

    input UpdateItemInput {
        id: ID
        title: String
        order: Int
        url: String
        groupId: String
        type: ItemType
        config: JSON
        tagIds: [ID]
#        tags: [String]
    }

    input CreateItemInput2 {
        title: String!
        url: String
        order: Int!
        tags: [String]
    }

    input CreateGroupInput2 {
        title: String!
        order: Int!
        items: [CreateItemInput2!]!
    }

    input CreateTabInput2 {
        title: String!
        order: Int!
        groups: [CreateGroupInput2!]!
    }
`
