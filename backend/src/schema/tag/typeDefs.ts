export const typeDefs = /* GraphQL */ `
    type Tag {
        id: ID!
        name: String!
        slug: String!
        createdAt: DateTime!
        updatedAt: DateTime
    }

    extend type Query {
#        meTags: [Tag!]!
        tags: [Tag!]!
        tag(id: ID!): Tag
        tagsPaged(page: DataTablePageInput): TagPage!
        tagsForFilter: [Tag!]!
        tagsSearchAutocomplete(query: String, limit: Int = 20): [Tag!]!
    }

    extend type Mutation {
        createTag(
            name: String!
            slug: String!
        ): Tag!
        updateTag(
            id: ID!
            name: String!
            slug: String!
        ): Tag!
        deleteTag(ids: [ID!]!): DeleteTagsPayload!
    }

    extend type Subscription {
        tagCreated: Tag!
        tagUpdated: Tag!
        tagDeleted: DeleteTagsPayload!
    }

    type TagPage {
        totalRecords: Int!
        tags: [Tag!]!
    }

    type DeleteTagsPayload {
        deleted: [Tag!]!
        totalCount: Int!
    }
`
