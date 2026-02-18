<script lang="ts" setup>
import { computed, type ComputedRef, type Ref, ref } from "vue";
import {
  type RouteLocationNormalizedLoaded,
  type Router,
  type RouteRecordNormalized,
  type RouteRecordRaw,
  useRoute,
  useRouter,
} from "vue-router";

const props = defineProps<{
  parentName: string; // z.B. "management-area" | "system"
}>();

const router: Router = useRouter();
const route: RouteLocationNormalizedLoaded = useRoute();

/**
 * Ruft aus dem VUE Router den Namen: 'content' | 'system' ab um die Children zubekommen
 */
const getRoutes: Ref<RouteRecordNormalized[]> = ref(
  router.getRoutes().filter((route) => {
    return route.name === props.parentName;
  }),
);

/**
 * Routen für den Tab aufbereiten bzw. abzugreifen aus dem Router
 */
const routes: ComputedRef<RouteRecordRaw[]> = computed(() => {
  if (!getRoutes.value.length) return [];

  const root = getRoutes.value[0];
  if (!root?.children) return [];

  return root.children.filter((r) => r.meta?.tab === true);
});

/**
 * Aktiven Tab bestimmen
 * - content.items.edit → content.items
 * - content.items.new  → content.items
 */
const activeTab = computed<string>(() => {
  if (!route.name) return "";

  const match = routes.value?.find((r) => route.name!.toString().startsWith(r.name!.toString()));

  return match?.path ?? "";
});
</script>

<template>
  <Tabs :value="activeTab">
    <TabList pt:tabList:class="justify-center bg-[var(--p-surface-section)]">
      <Tab v-for="tabRoute in routes" :key="tabRoute.name" :value="tabRoute.path">
        <router-link
          v-if="tabRoute.path"
          v-slot="{ href, navigate, isActive }"
          :to="{ name: tabRoute.name }"
          custom
        >
          <a
            v-ripple
            :href="href"
            class="flex flex-wrap items-center text-inherit"
            :class="isActive ? 'text-black dark:text-white' : ''"
            @click="navigate"
          >
            <i :class="tabRoute?.meta?.icon" class="w-full" />
            <span class="w-full hidden md:block md:text-xs lg:text-base">{{
              tabRoute?.meta?.title
            }}</span>
          </a>
        </router-link>
      </Tab>
    </TabList>
  </Tabs>
</template>
