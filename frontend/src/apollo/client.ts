// import {ApolloClient, from, InMemoryCache, split,} from '@apollo/client/core'
import {ApolloClient, from, InMemoryCache, split,} from '@apollo/client'

import {getMainDefinition} from '@apollo/client/utilities'


import {httpLink} from './links/http'
import {authLink} from './links/auth'
import {wsLink} from './links/ws'
import {refreshLink} from './links/refresh'
import {offlineLink} from "@/apollo/links/link.ts";


const splitLink = split(
    ({query}) => {
        const def = getMainDefinition(query)
        return (
            def.kind === 'OperationDefinition' &&
            def.operation === 'subscription'
        )
    },
    wsLink,
    from([offlineLink, refreshLink, authLink, httpLink])
)

export const apolloClient = new ApolloClient({
    link: splitLink,
    cache: new InMemoryCache(),
})