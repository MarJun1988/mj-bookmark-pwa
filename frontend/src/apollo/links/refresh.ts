//
// import { apolloClient } from '../client'
// import {useAuthStore} from "../../stores/auth.store.ts";
// import {REFRESH_TOKEN_MUTATION} from "../../graphql/mutations/refreshToken.ts";
// import {fromPromise} from "@apollo/client";
// import {onError} from "@apollo/client/link/error";
//
// let isRefreshing = false
// let pendingRequests: (() => void)[] = []
//
// function resolvePendingRequests() {
//     pendingRequests.forEach((cb) => cb())
//     pendingRequests = []
// }
//
// export const refreshLink = onError(
//     ({ graphQLErrors, operation, forward }) => {
//
//         console.log('refreshLink')
//
//         const auth = useAuthStore()
//
//         const unauthenticated = graphQLErrors?.some(
//             (e) => e.extensions?.code === 'UNAUTHENTICATED'
//         )
//
//         if (!unauthenticated) return
//
//         if (!isRefreshing) {
//             isRefreshing = true
//
//             return fromPromise(
//                 apolloClient
//                     .mutate({ mutation: REFRESH_TOKEN_MUTATION })
//                     .then((result) => {
//                         if (!result?.data) {
//                             auth.clear()
//                             return
//                         }
//
//                         auth.setAuth(
//                             result.data.refreshToken.accessToken,
//                             result.data.refreshToken.user
//                         )
//
//                         resolvePendingRequests()
//                     })
//                     .catch(() => {
//                         auth.clear()
//                     })
//                     .finally(() => {
//                         isRefreshing = false
//                     })
//             ).flatMap(() => forward(operation))
//         }
//
//         return fromPromise(
//             new Promise<void>((resolve) => {
//                 pendingRequests.push(resolve)
//             })
//         ).flatMap(() => forward(operation))
//     }
// )

import { onError } from "@apollo/client/link/error";
import { useAuthStore } from "@/stores/auth.store.ts";

export const refreshLink = onError(({ graphQLErrors }) => {
  if (graphQLErrors?.some((e) => e.extensions?.code === "UNAUTHENTICATED")) {
    const auth = useAuthStore();
    auth.clear();
  }
});
