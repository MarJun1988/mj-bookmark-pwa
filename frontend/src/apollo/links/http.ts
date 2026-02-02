import {HttpLink} from '@apollo/client'

export const httpLink = new HttpLink({
    uri: '/api/graphql',     // 🔥 über Proxy
    credentials: 'include', // weiterhin wichtig
})
