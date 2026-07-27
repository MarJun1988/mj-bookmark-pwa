<script lang="ts" setup>
import type { Item, ItemView, Tab } from "@/utils/interfaces.ts";
import ItemCard from "@/components/dashboard/ItemCard.vue";
import ItemCardSkeleton from "@/components/dashboard/ItemCardSkeleton.vue";
import { computed, type ComputedRef, type Ref, ref, watch } from "vue";
import { useDashboardStore } from "@/stores/dashboard.store.ts";
import { VueDraggable } from "vue-draggable-plus";

const dashboardStore = useDashboardStore();
const mode = computed(() => dashboardStore.mode);

const props = defineProps<{
  activeTab: Tab | null;
  activeGroupId: string | null; // 👈 neu
  items: Item[]; // nur Edit-Mode
}>();

const emits = defineEmits<{
  openActionMenu: [event: Event, group: Item];
  reorder: [items: { id: string; order: number }[]]; // 👈 wie bei groups (minimal payload)
}>();

/** VIEW: Items kommen aus Store (Skeleton oder echte) */
const itemsForView = computed<ItemView[]>(() => {
  return dashboardStore.itemsForView(props.activeTab?.id, props.activeGroupId ?? undefined);
});

/** VIEW sortiert (Skeleton bleibt trotzdem stabil, weil order existiert) */
const sortedItemsForView: ComputedRef<ItemView[]> = computed(() => {
  return [...itemsForView.value].sort((a, b) => {
    const ao = (a as any).order ?? 0;
    const bo = (b as any).order ?? 0;
    if (ao !== bo) return ao - bo;
    return (a.title ?? "").localeCompare(b.title ?? "");
  });
});

/** EDIT: echte Items aus Props (Drag&Drop) */
const sortedItems: ComputedRef<Item[]> = computed(() => {
  return [...props.items].sort((a, b) => {
    if ((a.order ?? 0) !== (b.order ?? 0)) return (a.order ?? 0) - (b.order ?? 0);
    return a.title.localeCompare(b.title);
  });
});

const localItems = ref<Item[]>([]);

watch(
  () => props.items,
  (items) => {
    localItems.value = [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  },
  { immediate: true },
);

const previousOrder: Ref<(string | undefined)[]> = ref([]);

function onDragStart() {
  previousOrder.value = localItems.value.map((i) => i.id);
}

function onDragEnd() {
  const changed: {
    id: string;
    order: number;
    groupId: string;
    title: string;
  }[] = [];

  localItems.value.forEach((item, index) => {
    const oldIndex = previousOrder.value.indexOf(item.id);
    if (oldIndex !== index && item.id) {
      changed.push({
        id: item.id,
        order: index,
        groupId: item.groupId,
        title: item.title,
      });
    }
  });

  if (changed.length > 0) emits("reorder", changed);
}

watch(
  () => mode.value,
  (m) => {
    if (m === "edit") {
      localItems.value = sortedItems.value.map((i) => ({ ...i }));
    }
  },
  { immediate: true },
);

const onUpdate = () => {
  console.log("update");
};
</script>

<template>
  <section>
    <template v-if="mode === 'edit'">
      <VueDraggable
        ref="el"
        v-model="localItems"
        :animation="150"
        class="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-4"
        ghostClass="opacity-40"
        @end="onDragEnd"
        @start="onDragStart"
        @update="onUpdate"
      >
        <template v-for="myItem in localItems" :key="myItem.id">
          <ItemCard
            :activeTab="props.activeTab"
            :item="myItem"
            @open-action-menu="emits('openActionMenu', $event, myItem)"
          />
        </template>
      </VueDraggable>
    </template>
    <!-- VIEW -->
    <div
      v-else
      class="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-4 3xl:grid-cols-6"
    >
      <template v-for="item in sortedItemsForView" :key="item.id">
        <ItemCardSkeleton v-if="item.__skeleton" />

        <ItemCard
          v-else-if="props.activeTab"
          :activeTab="props.activeTab"
          :item="item"
          @open-action-menu="!item.__skeleton && emits('openActionMenu', $event, item as Item)"
        />
      </template>

      <!-- echter leer Zustand (nur wenn kein Skeleton mehr aktiv) -->
      <div
        v-if="sortedItemsForView.length === 0 && !dashboardStore.showSkeleton"
        class="opacity-60"
      >
        Keine Einträge in dieser Ansicht.
      </div>
    </div>
  </section>
</template>
