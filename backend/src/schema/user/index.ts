import {typeDefs} from './typeDefs.js'
import {Query} from './query.js'
import {Mutation} from './mutation.js'
import {Subscription} from './subscription.js'
import {User} from './resolver.js'

export const userModule = {
    typeDefs,
    resolvers: {
        Query,
        Mutation,
        Subscription,
        User
    },
}
