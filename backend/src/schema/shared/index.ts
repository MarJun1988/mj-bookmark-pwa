import {base} from './base.js'
import {scalars} from './scalars.js'
import {enums} from './enums.js'
import {inputs} from './inputs.js'

import {GraphQLDateTime} from 'graphql-scalars'
import GraphQLJSON from 'graphql-type-json'

export const sharedModule = {
    typeDefs: [base, scalars, enums, inputs],
    resolvers: {
        DateTime: GraphQLDateTime,
        JSON: GraphQLJSON,
    }
}
