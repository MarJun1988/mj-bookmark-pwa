import {setContext} from '@apollo/client/link/context'
import {useAuthStore} from '../../stores/auth.store'

export const authLink = setContext((_, { headers }) => {
    const auth = useAuthStore()

    return {
        headers: {
            ...headers,
            authorization: auth.accessToken
                ? `Bearer ${auth.accessToken}`
                : '',
        },
    }
})
