import {typeDefs} from './typeDefs.js'
import {Query} from './query.js'
import {Mutation} from './mutation.js'
import {Subscription} from './subscription.js'
import {Group} from "./resolver.js";

export const groupModule = {
    typeDefs,
    resolvers: {
        Query,
        Mutation,
        Subscription,
        Group
    },
}
