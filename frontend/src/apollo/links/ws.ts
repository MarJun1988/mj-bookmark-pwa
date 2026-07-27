import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { useAuthStore } from "@/stores/auth.store.ts";
import { ref } from "vue";
import { devLog } from "@/utils/utils.ts";

const wsConnected = ref(false);

export const wsLink = new GraphQLWsLink(
  createClient({
    lazy: true,
    url: `${location.protocol === "https:" ? "wss" : "ws"}://${location.host}/api/graphql`,
    connectionParams: async () => {
      const auth = useAuthStore();
      return {
        authorization: auth.accessToken ? `Bearer ${auth.accessToken}` : "",
      };
    },
    retryAttempts: Infinity,

    on: {
      connected: () => {
        wsConnected.value = true;
        devLog("🟢 WS connected");
      },
      closed: () => {
        wsConnected.value = false;
        devLog("🔴 WS disconnected");
      },
    },
  }),
);
