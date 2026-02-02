import { defineStore } from "pinia";
import { ME_QUERY } from "@/graphql/queries/me";
import type {
  DashboardMode,
  Group,
  Item,
  ItemTypeValue,
  Tab,
  TabView,
} from "@/utils/interfaces";
import type { SearchResult, User } from "@/utils/interfaces.ts";
import {
  type RouteLocationNormalizedLoaded,
  type Router,
  useRoute,
} from "vue-router";
import { cacheGet, cacheSet } from "@/utils/db.ts";
import { useNetworkStore } from "@/stores/network.store.ts";
import { useToastStore } from "@/stores/toast.store.ts";
import { apolloClient } from "@/apollo/client.ts";

export const useDashboardStore = defineStore("dashboard", {
  /* ======================
       STATE
    ====================== */
  state: () => ({
    // Apollo raw result
    me: null as User | null,

    // Apollo meta
    loading: false,
    error: null as unknown | null,

    // UI
    mode: "view" as DashboardMode,

    activeTabId: null as string | null,
    activeGroupId: null as string | null,

    isGroupSheetOpen: false,

    bootstrapped: false,

    // 👇 NEU
    showSkeleton: true,
  }),

  /* ======================
       GETTERS
    ====================== */
  getters: {
    /* --- UI --- */
    isEditMode: (state) => state.mode === "edit",

    isLoading(state): boolean {
      return !state.bootstrapped;
    },

    hasData(state): boolean {
      return !!state.me && !!state.me.tabs?.length;
    },

    /* --- DATA --- */
    tabs(state): Tab[] {
      return state.me?.tabs ?? [];
    },
    groups(): Group[] {
      return this.tabs.flatMap((tab) => tab.groups ?? []);
    },

    items(): Item[] {
      return this.groups.flatMap((group) => group.items ?? []);
    },

    itemsByGroup: (state) => {
      return (groupId: string): Item[] =>
        state.me && state.me.tabs
          ? state.me.tabs
              .flatMap((t: Tab) => t.groups ?? [])
              .flatMap((g: Group) => g.items ?? [])
              .filter((i: Item) => i.groupId === groupId)
          : [];
    },

    searchItems() {
      return (query: unknown): SearchResult[] => {
        if (typeof query !== "string") return [];

        const q = query.trim().toLowerCase();
        if (!q) return [];

        const results: SearchResult[] = [];
        const seen = new Set<string>();

        for (const tab of this.tabs) {
          for (const group of tab.groups ?? []) {
            for (const item of group.items ?? []) {
              let match = false;

              if (item.title?.toLowerCase().includes(q)) {
                match = true;
              }

              if (!match) {
                match =
                  item.tags?.some(
                    (tag) =>
                      tag.slug?.toLowerCase().includes(q) ||
                      tag.name?.toLowerCase().includes(q),
                  ) ?? false;
              }

              if (match && item.id && !seen.has(item.id)) {
                seen.add(item.id);
                results.push({
                  item,
                  tab,
                  group,
                  label: `${item.title} — ${tab.title} / ${group.title}`,
                });
              }
            }
          }
        }

        return results;
      };
      // return (query: string): SearchResult[] => {
      //     const q = query.trim().toLowerCase()
      //     if (!q) return []
      //
      //     const results: SearchResult[] = []
      //     const seen = new Set<string>() // Item-Dedupe
      //
      //     for (const tab of this.tabs) {
      //         for (const group of tab.groups ?? []) {
      //             for (const item of group.items ?? []) {
      //                 let match = false
      //
      //                 // 🔍 Titel
      //                 if (item.title?.toLowerCase().includes(q)) {
      //                     match = true
      //                 }
      //
      //                 // 🏷 Tags
      //                 if (!match) {
      //                     match = item.tags?.some(tag =>
      //                         tag.slug?.toLowerCase().includes(q) ||
      //                         tag.name?.toLowerCase().includes(q)
      //                     ) ?? false
      //                 }
      //
      //                 if (match && !seen.has(item.id)) {
      //                     seen.add(item.id)
      //
      //                     results.push({
      //                         item,
      //                         tab,
      //                         group,
      //                         label: `${item.title} — ${tab.title} / ${group.title}`,
      //                     })
      //                 }
      //             }
      //         }
      //     }
      //
      //     return results
      // }
    },

    activeGroup(state): Group | null {
      if (!state.me) return null;
      if (!state.activeTabId) return null;
      if (!state.activeGroupId) return null;
      if (!state.me.tabs) return null;

      const tab = state.me.tabs.find((t) => t.id === state.activeTabId);
      if (!tab || !tab.groups) return null;

      return tab.groups.find((g) => g.id === state.activeGroupId) ?? null;
    },

    activeTab(state): Tab | null {
      if (!state.me) return null;
      if (!state.activeTabId) return null;
      if (!state.me.tabs) return null;

      return state.me.tabs.find((t) => t.id === state.activeTabId) ?? null;
    },

    tabsForView(state): TabView[] {
      if (state.showSkeleton) {
        return Array.from({ length: 4 }, (_, i) => ({
          id: `skeleton-tab-${i}`,
          title: "",
          order: i,
          __skeleton: true,
          groups: [],
        }));
      }

      return [...(state.me?.tabs ?? [])].sort((a, b) => a.order - b.order);
    },

    groupsForView: (state) => {
      return (_tabId?: string) => {
        if (state.showSkeleton) {
          return Array.from({ length: 6 }, (_, i) => ({
            id: `sk-g-${i}`,
            title: "",
            tabId: "",
            order: i,
            __skeleton: true,
            items: [],
          }));
        }

        if (!_tabId) return [];

        const tab = state.me?.tabs?.find((t) => t.id === _tabId);
        if (!tab) return [];

        return [...(tab.groups ?? [])].sort((a, b) => a.order - b.order);
      };
    },

    itemsForView: (state) => {
      return (tabId?: string, groupId?: string) => {
        // 🧱 Skeleton-Phase
        if (!state.bootstrapped) {
          return Array.from({ length: 8 }, (_, i) => ({
            id: `skeleton-item-${i}`,
            title: "",
            type: "LINK" as ItemTypeValue, // ✅ wichtig
            __skeleton: true,
          }));
        }

        if (!tabId) return [];

        const tab = state.me?.tabs?.find((t) => t.id === tabId);
        if (!tab) return [];

        // const allItems = tab.groups?.flatMap((g) => g.items ?? []) ?? [];
        //
        // // ✅ Alle Gruppen im Tab
        // if (groupId === undefined) {
        //   return allItems;
        // }
        //
        // // ✅ Nur eine Gruppe
        // return allItems.filter((i) => i.groupId === groupId);

        // ----

        const items =
          groupId === undefined
            ? (tab.groups?.flatMap((g) => g.items ?? []) ?? [])
            : (tab.groups?.find((g) => g.id === groupId)?.items ?? []);

        return [...items].sort((a, b) => a.order - b.order);
      };
    },
  },

  /* ======================
       ACTIONS
    ====================== */
  actions: {
    deleteItem(id: string) {
      for (const group of this.groups) {
        const index = group.items?.findIndex((i) => i.id === id);
        if (index !== undefined && index > -1) {
          // group.items.splice(index, 1)
          break;
        }
      }
    },

    setActiveTab(tabId: string) {
      this.activeTabId = tabId;
    },
    setActiveGroup(groupId: string | null) {
      this.activeGroupId = groupId;
    },

    syncWithRoute(route = useRoute()) {
      this.mode = route.query.mode === "edit" ? "edit" : "view";
    },

    toggleEditMode(router: Router, route: RouteLocationNormalizedLoaded) {
      const query = { ...route.query };

      const toastStore = useToastStore();

      const networkStore = useNetworkStore();

      if (networkStore.online) {
        if (this.isEditMode) {
          delete query.mode;
        } else {
          query.mode = "edit";
        }

        router.replace({ query });
      } else {
        // ❌ Fehler
        toastStore.error({
          summary: "Offline Modus",
          detail:
            "Sie haben keine Verbindung zum Netzwerk, bearbeiten nicht möglich!",
        });
      }
    },

    upsertTab(tab: Tab) {
      if (!this.me?.tabs) return;

      const exists = this.me.tabs.some((t) => t.id === tab.id);

      this.me = {
        ...this.me,
        tabs: exists
          ? this.me.tabs.map((t) =>
              t.id === tab.id
                ? {
                    ...t,
                    title: tab.title,
                    order: tab.order,
                  }
                : t,
            )
          : [...this.me.tabs, tab],
      };
    },

    removeTab(tabId: string) {
      if (!this.me?.tabs) return;

      this.me = {
        ...this.me,
        tabs: this.me.tabs.filter((t) => t.id !== tabId),
      };
    },

    upsertGroup(group: Group) {
      if (!this.me?.tabs) return;

      this.me = {
        ...this.me,
        tabs: this.me.tabs.map((tab) => {
          // ❌ falscher Tab → unverändert lassen
          if (tab.id !== group.tabId) return tab;

          const groups = tab.groups ?? [];
          const exists = groups.some((g) => g.id === group.id);

          return {
            ...tab,
            groups: exists
              ? groups.map((g) =>
                  g.id === group.id
                    ? {
                        ...g,
                        title: group.title,
                        order: group.order,
                      }
                    : g,
                )
              : [...groups, group],
          };
        }),
      };
    },

    removeGroup(groupId: string, tabId: string) {
      if (!this.me?.tabs) return;

      this.me = {
        ...this.me,
        tabs: this.me.tabs.map((tab) =>
          tab.id === tabId
            ? {
                ...tab,
                groups: (tab.groups ?? []).filter((g) => g.id !== groupId),
              }
            : tab,
        ),
      };
    },

    upsertItem(item: Item) {
      if (!this.me?.tabs) return;

      this.me = {
        ...this.me,
        tabs: this.me.tabs.map((tab) => ({
          ...tab,
          groups: (tab.groups ?? []).map((group) => {
            if (group.id !== item.groupId) return group;

            const items = group.items ?? [];
            const exists = items.some((i) => i.id === item.id);

            return {
              ...group,
              items: exists
                ? items.map((i) =>
                    i.id === item.id
                      ? {
                          ...i,
                          title: item.title,
                          order: item.order,
                          type: item.type,
                          url: item.url,
                          config: item.config,
                          tags: item.tags,
                        }
                      : i,
                  )
                : [...items, item],
            };
          }),
        })),
      };
    },

    removeItem(itemId: string, groupId: string) {
      if (!this.me?.tabs) return;

      this.me = {
        ...this.me,
        tabs: this.me.tabs.map((tab) => ({
          ...tab,
          groups: (tab.groups ?? []).map((group) =>
            group.id === groupId
              ? {
                  ...group,
                  items: (group.items ?? []).filter((i) => i.id !== itemId),
                }
              : group,
          ),
        })),
      };
    },

    openGroupSheet() {
      this.isGroupSheetOpen = true;
    },
    closeGroupSheet() {
      this.isGroupSheetOpen = false;
    },

    async loadDashboardOnline() {
      const { data } = await apolloClient.query({
        query: ME_QUERY,
        fetchPolicy: "network-only",
      });

      this.me = data.me;
      await cacheSet("me", data.me); // 🔥 Snapshot speichern
    },

    async loadDashboardOffline() {
      const cached = await cacheGet<User>("me");
      if (cached) {
        this.me = cached;
      }
    },

    async bootstrapDashboard() {
      const network = useNetworkStore();

      // 1️⃣ Skeleton aktiv
      this.showSkeleton = true;
      this.bootstrapped = false;

      // 2️⃣ EIN Render-Frame garantieren
      await new Promise(requestAnimationFrame);

      if (network.online) {
        await this.loadDashboardOnline();
      } else {
        await this.loadDashboardOffline();
      }

      // 4️⃣ Skeleton AUS
      this.showSkeleton = false;
      this.bootstrapped = true;
    },
  },
});
