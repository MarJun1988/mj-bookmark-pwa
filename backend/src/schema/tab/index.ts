import {typeDefs} from './typeDefs.js'
import {Query} from './query.js'
import {Mutation} from './mutation.js'
import {Subscription} from './subscription.js'
import {Tab} from "./resolver.js";

export const tabModule = {
    typeDefs,
    resolvers: {
        Query,
        Mutation,
        Subscription,
        Tab
    },
}
