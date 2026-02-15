<script lang="ts" setup>
import { useAuthStore } from "../stores/auth.store.ts";
import { computed, type ComputedRef, ref } from "vue";
import { useDashboardStore } from "@/stores/dashboard.store.ts";
import type { SearchResult } from "@/utils/interfaces.ts";
import { router } from "@/router";
import { useTheme } from "@/composable/useTheme.ts";
import type { MenuItem } from "primevue/menuitem";
import { ROUTE } from "@/utils/router.names.ts";
import { useRoute } from "vue-router";
import { useUiStore } from "@/stores/ui.store";
import { useCommonStore } from "@/stores/common.store.ts";
import { storeToRefs } from "pinia";
import { useBreakpoint } from "@/composable/useBreakpoint.ts";

const { isDark, toggleTheme } = useTheme();

const auth = useAuthStore();
const dashboard = useDashboardStore();
const route = useRoute();

const ui = useUiStore();
const search = ref("");

// allgemeiner Store
const common = useCommonStore();

const { isLoading } = storeToRefs(common);

const userMenuItems: ComputedRef<MenuItem[]> = computed(() => {
  const items: MenuItem[] = [
    {
      label: "Profil",
      icon: "pi pi-user",
      command: () => router.push({ name: ROUTE.PROFILE.ROOT }),
    },

    {
      label: "Inhalte verwalten",
      icon: "pi pi-folder",
      command: () => router.push({ name: ROUTE.CONTENT.ROOT }),
    },

    {
      label: dashboard.isEditMode ? "Fertig" : "Bearbeiten",
      icon: dashboard.isEditMode ? "pi pi-check" : "pi pi-pencil",
      command: () => dashboard.toggleEditMode(router, route),
      visible: route.name === ROUTE.DASHBOARD,
    },

    { separator: true },

    {
      label: isDark.value ? "Heller Modus" : "Dunkler Modus",
      icon: isDark.value ? "pi pi-sun" : "pi pi-moon",
      command: toggleTheme,
    },
  ];

  if (auth.isAdmin) {
    items.push(
      { separator: true },
      {
        label: "Systemverwaltung",
        icon: "pi pi-shield",
        isAdmin: true,
        command: () => router.push({ name: ROUTE.SYSTEM.ROOT }),
      },
    );
  }

  items.push(
    { separator: true },
    { label: "Abmelden", icon: "pi pi-sign-out", command: auth.logout },
  );

  return items;
});

function onSelect(e: { value: SearchResult }) {
  const { item, tab, group } = e.value;

  router.push({
    path: "/",
    query: {
      tab: tab.id,
      group: group.id,
      item: item.id,
    },
  });

  // 2️⃣ Nach z. B. 3 Sekunden URL bereinigen
  setTimeout(() => {
    router.replace({
      path: "/",
      query: {}, // 👈 entfernt alle Query-Parameter
    });
  }, 3000);

  search.value = "";
  results.value = [];
}

const results = ref();

const onComplete = (e: { query: string }) => {
  results.value = dashboard.searchItems(e.query);
};

const { isMobile } = useBreakpoint();
</script>

<template>
  <header
    class="sticky top-0 z-50 w-full min-h-14 md:min-h-16 border-b shadow-md bg-(--p-surface-section) border-b-(--p-text-color)"
  >
    <div
      class="grid grid-cols-[auto_1fr_auto] items-center px-3 sm:px-4 md:px-6 py-2 cursor-pointer"
    >
      <div class="flex items-center gap-2 sm:gap-3" @click="router.push('/')">
        <div
          class="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg sm:rounded-xl font-bold"
        >
          <img alt="Bookmark App" class="h-10" src="@/assets/images/logo.png" />
        </div>

        <div class="hidden sm:block leading-tight">
          <div class="text-xs sm:text-sm font-semibold">Bookmark</div>
          <div class="text-[10px] sm:text-xs text-(--p-text-secondary-color)">Dashboard</div>
        </div>
      </div>
      <!-- Suche -->
      <div class="flex items-center justify-center">
        <div class="w-50 md:w-100 lg:w-120 xl:w-140 2xl:w-160 self-center">
          <FloatLabel :variant="ui.floatLabelVariant">
            <AutoComplete
              v-model="search"
              :suggestions="results"
              fluid
              optionLabel="label"
              showClear
              @complete="onComplete"
              @item-select="onSelect"
            />
            <label v-if="!isMobile" for="input-search"
              >Lesezeichen, Tags oder Feeds durchsuchen</label
            >
            <label v-else for="input-search">suche ...</label>
          </FloatLabel>
        </div>
      </div>

      <!-- Nutzermenü -->
      <div class="flex items-center justify-end gap-1 sm:gap-2">
        <SplitButton
          :label="auth.user?.displayName ?? ''"
          :model="userMenuItems"
          severity=""
          size="small"
        >
          <template #item="{ item, props, hasSubmenu }">
            <a
              :class="{
                'text-orange-500 font-semibold': item.isAdmin,
              }"
              class="flex items-center gap-2"
              v-bind="props.action"
            >
              <span :class="item.icon" />
              <span>{{ item.label }}</span>
              <i v-if="hasSubmenu" class="pi pi-angle-right ml-auto" />
            </a>
          </template>
        </SplitButton>
      </div>
    </div>
    <!-- Loading Spinner -->
    <ProgressBar
      :mode="isLoading ? 'indeterminate' : 'determinate'"
      class="max-h-1 rounded-none! w-full fixed! bg-transparent!"
    />
  </header>
</template>
