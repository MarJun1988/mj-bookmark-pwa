import {typeDefs} from './typeDefs.js'
import {Query} from './query.js'
import {Mutation} from './mutation.js'
import {Subscription} from './subscription.js'
import {Item} from "./resolver.js";

export const itemModule = {
    typeDefs,
    resolvers: {
        Query,
        Mutation,
        Subscription,
        Item
    },
}
