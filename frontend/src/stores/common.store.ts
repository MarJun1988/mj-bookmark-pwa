import { defineStore } from "pinia";
import type { ApolloError } from "@apollo/client";

export const useCommonStore = defineStore("commonStore", {
  // ======================
  // STATE
  // ======================
  state: () => ({
    loadingCount: 0,
    isLoadingFaviconAndTitle: false as boolean,
    error: null as ApolloError | unknown | null,
  }),

  // ======================
  // GETTERS
  // ======================
  getters: {
    isLoading: (state) => state.loadingCount > 0,
  },

  // ======================
  // ACTIONS
  // ======================
  actions: {
    startLoading() {
      this.loadingCount++;
    },

    stopLoading() {
      this.loadingCount = Math.max(0, this.loadingCount - 1);
    },

    async withLoading<T>(fn: () => Promise<T>): Promise<T> {
      this.startLoading();
      try {
        return await fn();
      } finally {
        this.stopLoading();
      }
    },

    setError(err: unknown) {
      this.error = err;
    },

    clearError() {
      this.error = null;
    },
  },
});
