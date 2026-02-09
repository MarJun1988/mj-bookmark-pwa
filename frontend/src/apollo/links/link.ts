import {useNetworkStore} from "@/stores/network.store.ts";
import {ApolloLink} from "@apollo/client";

export const offlineLink = new ApolloLink((operation, forward) => {
    const network = useNetworkStore()

    if (!network.online && operation.operationName !== 'Me') {
        throw new Error('OFFLINE_MODE')
    }

    return forward(operation)
})
