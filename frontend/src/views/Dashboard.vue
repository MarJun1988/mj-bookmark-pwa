<script lang="ts" setup>
import {
  computed,
  type ComputedRef,
  nextTick,
  onMounted,
  onUnmounted,
  type Ref,
  ref,
  watch,
} from "vue";
import {
  type Group,
  type Item,
  type MenuContext,
  type MyMenuItem,
  type Tab,
  type TabView,
} from "@/utils/interfaces.ts";
import { useDashboardStore } from "@/stores/dashboard.store.ts";
import { useRoute } from "vue-router";
import GroupContext from "@/components/dashboard/GroupContext.vue";
import GroupItems from "@/components/dashboard/GroupItems.vue";
import TabPanelGroups from "@/components/dashboard/TabPanelGroups.vue";
import TabListTabs from "@/components/dashboard/TabListTabs.vue";
import { ROUTE } from "@/utils/router.names.ts";
import { router } from "@/router";
import {
  startGlobalSubscriptions,
  stopGlobalSubscriptions,
} from "@/composable/subscriptions.sync.ts";
import { useTabStore } from "@/stores/tab.store.ts";
import { useGroupStore } from "@/stores/group.store.ts";
import { useItemStore } from "@/stores/item.store.ts";
import { useNetworkStore } from "@/stores/network.store.ts";
import { storeToRefs } from "pinia";

const dashboardStore = useDashboardStore();
const tabStore = useTabStore();
const groupStore = useGroupStore();
const itemStore = useItemStore();
const hasRestoredState = ref(false);

const route = useRoute();

const editRouteMap = {
  tab: ROUTE.CONTENT.TABS_EDIT,
  group: ROUTE.CONTENT.GROUPS_EDIT,
  item: ROUTE.CONTENT.ITEMS_EDIT,
} as const;

const deleteRouteMap = {
  tab: ROUTE.CONTENT.TABS_DELETE,
  group: ROUTE.CONTENT.GROUPS_DELETE,
  item: ROUTE.CONTENT.ITEMS_DELETE,
} as const;

const menuContext: Ref<MenuContext | null> = ref<MenuContext | null>(null);

const scrollToItem = (itemId: string) => {
  const el = document.querySelector(`[data-item-id="${itemId}"]`);
  if (!el) return;

  el.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });

  // optional Highlight
  el.classList.add("ring-2", "bg-[var(--p-surface-border)]");
  setTimeout(() => {
    el.classList.remove("ring-2", "bg-[var(--p-surface-border)]");
  }, 1500);
};

const activeTabId = computed({
  get() {
    // 👇 WICHTIG: während Skeleton immer erstes Skeleton-Tab aktiv
    if (dashboardStore.showSkeleton) {
      return dashboardStore.tabsForView[0]?.id ?? "";
    }

    return (
      dashboardStore.activeTabId ?? dashboardStore.tabsForView[0]?.id ?? ""
    );

    // return dashboardStore.activeTabId ?? tabs.value[0]?.id ?? "0";
  },
  set(value: string) {
    dashboardStore.setActiveTab(value);
  },
});

const activeGroupId = computed({
  get() {
    return dashboardStore.activeGroupId;
  },
  set(value: string | null) {
    if (value === "") {
      dashboardStore.setActiveGroup(null);
    } else {
      dashboardStore.setActiveGroup(value);
    }
  },
});
const tabs: ComputedRef<Tab[]> = computed(() => dashboardStore.tabs);

const activeTab: ComputedRef<Tab | null> = computed<Tab | null>(() => {
  if (!activeTabId.value) return null;
  return tabs.value.find((t) => t.id === activeTabId.value) ?? null;
});

const groupsForActiveTab: ComputedRef<Group[]> = computed<Group[]>(() => {
  return activeTab.value?.groups ?? ([] as Group[]);
});

const activeGroup: ComputedRef<Group | null> = computed<Group | null>(() => {
  if (!activeGroupId.value) return null;

  return (
    groupsForActiveTab.value.find((g) => g.id === activeGroupId.value) ?? null
  );
});

const itemsForActiveTab = computed(() =>
  groupsForActiveTab.value.flatMap((g) => g.items ?? []),
);

const itemsForActiveGroup: ComputedRef<Item[]> = computed<Item[]>(() => {
  // keine Gruppe aktiv → alle Items des Tabs
  // ✅ WICHTIG: null = Alle
  if (!activeGroupId.value) {
    return itemsForActiveTab.value;
  }

  // Gruppe aktiv → nur deren Items
  return itemsForActiveTab.value.filter(
    (item) => item.groupId === activeGroupId.value,
  );
});
const tabMenu = ref();

const menuItems: Ref<MyMenuItem[]> = ref([
  {
    label: "Bearbeiten",
    icon: "pi pi-pencil",
    tooltip: "Alle Eigenschaften bearbeiten",
    command: () => {
      if (!menuContext.value) return;

      router.push({
        name: editRouteMap[menuContext.value.type],
        params: { id: menuContext.value.id },
      });
    },
  },
  {
    label: "Löschen",
    icon: "pi pi-trash",
    tooltip: "Eintrag endgültig löschen",
    class: "text-red-500",
    command: () => {
      if (!menuContext.value) return;

      router.push({
        name: deleteRouteMap[menuContext.value.type],
        params: { id: menuContext.value.id },
      });
    },
  },
]);
const LS_ACTIVE_TAB: string = "dashboard.activeTab";
const LS_ACTIVE_GROUP: string = "dashboard.activeGroupByTab";

const restoreTabAndGroup = () => {
  // TAB
  const storedTab = localStorage.getItem(LS_ACTIVE_TAB);
  if (storedTab && tabs.value.some((t) => t.id === storedTab)) {
    activeTabId.value = storedTab;
  }

  // GRUPPE (tab-abhängig)
  const rawGroups = localStorage.getItem(LS_ACTIVE_GROUP);
  if (!rawGroups) return;

  try {
    const groupMap: Record<string, string> = JSON.parse(rawGroups);
    const groupId = groupMap[dashboardStore.activeTabId ?? ""];

    if (groupId && groupsForActiveTab.value.some((g) => g.id === groupId)) {
      activeGroupId.value = groupId;
    } else {
      activeGroupId.value = null;
    }
  } catch {
    activeGroupId.value = null;
  }
};

const restoreGroupForTab = (tabId: string) => {
  const raw = localStorage.getItem(LS_ACTIVE_GROUP);
  if (!raw) return;

  try {
    const map: Record<string, string> = JSON.parse(raw);
    const groupId = map[tabId];

    if (groupId && groupsForActiveTab.value.some((g) => g.id === groupId)) {
      activeGroupId.value = groupId;
    }
  } catch {
    activeGroupId.value = "";
  }
};

const openTabMenu = (event: Event, item: TabView | Group | Item) => {
  switch (item.__typename) {
    case "Tab":
      if (item && item.id) {
        menuContext.value = { type: "tab", id: item.id };
      }

      break;
    case "Group":
      if (item && item.id) {
        menuContext.value = { type: "group", id: item.id };
      }
      break;
    case "Item":
      if (item && item.id) {
        menuContext.value = { type: "item", id: item.id };
      }
      break;
  }

  tabMenu.value.toggle(event);
};

watch(
  () => dashboardStore.tabs,
  (tabs) => {
    if (!tabs.length) return;
    if (dashboardStore.activeTabId) return;
    if (!hasRestoredState.value) return;

    activeTabId.value = tabs[0]?.id ?? "0";
  },
);

watch(
  () => route.query,
  async (query) => {
    if (!query.item) return;

    // 1. Tab aktivieren
    if (query.tab) {
      dashboardStore.setActiveTab(query.tab as string);
    }

    // 2. Gruppe aktivieren
    if (query.group) {
      setTimeout(function () {
        dashboardStore.setActiveGroup(query.group as string);
      }, 100);
    }

    // 3. Warten bis DOM da ist
    await nextTick();

    setTimeout(function () {
      scrollToItem(query.item as string);
    }, 100);

    // 4. Scroll
  },
  { immediate: true },
);

watch(activeTabId, (newTabId) => {
  if (!newTabId || !hasRestoredState.value) return;

  // Tab speichern
  localStorage.setItem(LS_ACTIVE_TAB, newTabId);

  // Gruppe beim Tab-Wechsel immer resetten
  activeGroupId.value = "";

  // Optional: gespeicherte Gruppe für diesen Tab laden
  restoreGroupForTab(newTabId);
});

watch(activeGroupId, (groupId) => {
  const tabId = activeTabId.value;
  if (!tabId) return;

  const raw = localStorage.getItem(LS_ACTIVE_GROUP);
  const map: Record<string, string> = raw ? JSON.parse(raw) : {};

  if (!groupId) {
    delete map[tabId];
  } else {
    map[tabId] = groupId;
  }

  localStorage.setItem(LS_ACTIVE_GROUP, JSON.stringify(map));
});

watch(
  () => dashboardStore.tabs,
  (tabs) => {
    if (!tabs.length || hasRestoredState.value) return;

    restoreTabAndGroup();
    hasRestoredState.value = true;
  },
  { immediate: true },
);
onMounted(async () => {
  await dashboardStore.bootstrapDashboard();
  await startGlobalSubscriptions();
});

onUnmounted(() => {
  stopGlobalSubscriptions();
});

watch(
  () => route.query.mode,
  () => dashboardStore.syncWithRoute(route),
  { immediate: true },
);

const reorderTab = (tabs: { id: string; order: number }[]) => {
  tabs.forEach((tab) => {
    tabStore.updateItem(tab);
  });
};

const reorderGroup = (groups: { id: string; order: number }[]) => {
  groups.forEach((group) => {
    groupStore.updateItem(group);
  });
};

const reorderItem = (items: { id: string; order: number }[]) => {
  items.forEach((item) => itemStore.updateItem(item));
};

const networkStore = useNetworkStore();
const { online, shouldReloadAfterOnline } = storeToRefs(networkStore);

watch(online, (isOnline) => {
  if (isOnline && shouldReloadAfterOnline.value) {
    console.log("🔄 Reload app after offline start");
    networkStore.clearReloadFlag();
    // Bringt keinen Effekt!
    // window.location.reload()
  }
});
</script>

<template>
  <!-- Tabs Leiste -->
  <Tabs
    v-model:value="activeTabId"
    class="w-full"
    lazy
  >
    <!-- Anzeige Tabs mit bearbeiten und neuer Eintrag  -->
    <TabListTabs
      :tabs="dashboardStore.tabsForView"
      @reorder="reorderTab"
      @open-action-menu="openTabMenu"
      @add-item="router.push(tabStore.routeToNewItem())"
    />

    <TabPanels class="bg-(--p-surface-section)">
      <TabPanel
        v-for="tab in dashboardStore.tabsForView"
        :key="tab.id"
        :value="tab.id ?? tab.title"
      >
        <!-- Groups as Button -->
        <TabPanelGroups
          :groups="tab.__skeleton ? [] : (tab.groups ?? [])"
          :tab-id="tab.id"
          @reorder="reorderGroup"
          @open-action-menu="openTabMenu"
          @add-item="router.push(groupStore.routeToNewItem())"
        />

        <!-- Context -->
        <GroupContext
          v-if="!tab.__skeleton && activeTab"
          :active-group="activeGroup"
          :activeGroupId="activeTabId"
          :activeTab="activeTab"
          @add-item="router.push(itemStore.routeToNewItem())"
        />

        <!-- Items -->
        <GroupItems
          :activeTab="activeTab"
          :activeGroupId="activeGroupId"
          :items="itemsForActiveGroup"
          @reorder="reorderItem"
          @open-action-menu="openTabMenu"
        />
      </TabPanel>
    </TabPanels>
  </Tabs>

  <Menu
    ref="tabMenu"
    :model="menuItems"
    popup
  >
    <template #item="{ item, props }">
      <a
        v-tooltip.right="{
          value: item.tooltip,
          pt: {
            text: '!text-sm !font-medium w-60 text-center',
          },
        }"
        :class="item.class"
        class="flex items-center gap-2"
        v-bind="props.action"
      >
        <span :class="item.icon" />
        <span>{{ item.label }}</span>
      </a>
    </template>
  </Menu>
</template>
