import { defineStore } from "pinia";
import { apolloClient } from "@/apollo/client.ts";
import { REFRESH_TOKEN_MUTATION } from "@/graphql/mutations/refreshToken.ts";
import { router } from "@/router";
import { LOGOUT_MUTATION } from "@/graphql/mutations/logout.ts";
import type { AuthUser } from "@/utils/interfaces.ts";
// import {devLog} from "@/utils/utils.ts";
import { useNetworkStore } from "@/stores/network.store.ts";

let refreshPromise: Promise<any> | null = null;

export const useAuthStore = defineStore("auth", {
  state: () => ({
    accessToken: null as string | null,
    user: null as AuthUser | null,
    initialized: false,
    bootstrapped: false,
  }),

  getters: {
    isAuthenticated(state) {
      const network = useNetworkStore();

      // 🔌 Offline → Session gilt als "lokal authentifiziert"
      if (!network.online) {
        return true;
      }

      return !!state.accessToken;
    },

    isReady: (state) => state.initialized,
    isAdmin: (state) => state.user?.role === "ADMIN",
  },

  actions: {
    async refreshAccessToken() {
      // 🔒 MUTEX
      if (!refreshPromise) {
        refreshPromise = apolloClient
          .mutate({
            mutation: REFRESH_TOKEN_MUTATION,
          })
          .then(({ data }) => {
            this.accessToken = data.refreshToken.accessToken;
            this.user = data.refreshToken.user;
          })
          .finally(() => {
            refreshPromise = null;
            this.initialized = true;
          });
      }

      return refreshPromise;
    },

    setAuth(token: string, user: AuthUser) {
      this.accessToken = token;
      this.user = user;
      sessionStorage.removeItem("loggedOut");
    },

    clear() {
      this.accessToken = null;
      this.user = null;

      void router.replace({ name: "login" });
    },

    async logout() {
      try {
        await apolloClient.mutate({
          mutation: LOGOUT_MUTATION,
        });
      } catch {
        // Backend darf fehlschlagen – Logout trotzdem durchführen
      } finally {
        this.clear();
      }
    },

    async bootstrap() {
      if (this.bootstrapped) return;

      try {
        await this.refreshAccessToken();
      } catch {
        this.accessToken = "";
        this.user = null;
      } finally {
        this.bootstrapped = true;
      }
    },
  },
});
