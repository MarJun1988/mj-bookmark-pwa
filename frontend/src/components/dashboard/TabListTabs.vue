<script lang="ts" setup>
import { useDashboardStore } from "@/stores/dashboard.store.ts";

import type { Tab, TabView } from "@/utils/interfaces.ts";
import { computed, ref, watch } from "vue";
import { type UseDraggableReturn, VueDraggable } from "vue-draggable-plus";

const dashboardStore = useDashboardStore();

// aktuell bearbeiten
const mode = computed(() => dashboardStore.mode);

/* ======================
   Props
====================== */
const props = defineProps<{
  tabs: TabView[];
}>();

/* ======================
   Emits
====================== */
const emits = defineEmits<{
  // Event ohne Parameter
  // close: []

  // Event mit einem Parameter
  openActionMenu: [event: Event, tab: TabView];
  addItem: [];

  // Event mit mehreren Parametern
  // update: [id: number, name: string]
  reorder: [tabs: Tab[]];
}>();

const localTabs = ref<TabView[]>([]);

watch(
  () => props.tabs,
  (tabs) => {
    localTabs.value = [...tabs].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  },
  { immediate: true },
);

const previousOrder = ref<string[]>([]);

watch(
  () => mode.value,
  (m) => {
    if (m === "edit") {
      localTabs.value = dashboardStore.tabsForView
        .filter((t) => !t.__skeleton)
        .map((t) => ({ ...t }));
    }
  },
  { immediate: true },
);

const el = ref<UseDraggableReturn>();

const arraysEqual = (a: string[], b: string[]) =>
  a.length === b.length && a.every((v, i) => v === b[i]);

/**
 * Start beim Verschieben der Tabs
 * Speichern des "aktuellen" Standes
 * param e: DraggableEvent
 */
const onStart = () => {
  previousOrder.value = localTabs.value.map((t) => t.id);
};

/**
 * Ende beim Verschieben der Tabs
 * Prüfen, welche Tabs sich verändert haben, und diese dann speichern
 * param e: DraggableEvent
 */
const onEnd = () => {
  // neue Anordnung der Tabs
  const newOrder = localTabs.value.map((t) => t.id);
  // geänderte Tabs
  const changed: Tab[] = [];
  // gibt es Änderungen?
  if (arraysEqual(previousOrder.value, newOrder)) {
    return; // nichts passiert
  } else {
    // Reihenfolge ändern (order)
    localTabs.value.forEach((tab, index) => {
      const oldIndex = previousOrder.value.indexOf(tab.id);
      if (oldIndex !== index) {
        changed.push({
          ...tab,
          order: index,
        } as Tab);
      }
    });

    if (changed.length > 0) {
      emits("reorder", changed);
    }
  }

  // persistieren
};

const onUpdate = () => {
  console.log("update");
};
</script>

<template>
  <TabList class="bg-(--p-surface-section)">
    <!-- EDIT MODE   -->
    <template v-if="mode === 'edit'">
      <VueDraggable
        ref="el"
        v-model="localTabs"
        :animation="150"
        class="flex items-center gap-1"
        ghostClass="opacity-40"
        @end="onEnd"
        @start="onStart"
        @update="onUpdate"
      >
        <Tab
          v-for="tab in localTabs"
          :key="tab.id"
          :value="tab.id"
          as="div"
          class="flex items-center p-2 cursor-move"
        >
          <!-- Titel -->
          <span class="font-bold whitespace-nowrap flex-1">
            {{ tab.title }}
          </span>

          <!-- Aktionsmenü -->
          <Button
            class="opacity-60 hover:opacity-100"
            icon="pi pi-ellipsis-v"
            rounded
            size="small"
            text
            @click="emits('openActionMenu', $event, tab)"
          />
        </Tab>
      </VueDraggable>
    </template>
    <!-- VIEW MODE -->
    <template v-else>
      <Tab
        v-for="tab in dashboardStore.tabsForView"
        :key="tab.id"
        :value="tab.id"
        class="flex items-center gap-1 justify-between p-2 mr-10"
      >
        <Skeleton
          v-if="tab.__skeleton"
          class="min-w-30 min-h-6"
        />

        <span
          v-else
          class="font-bold block"
        >
          {{ tab.title }}
        </span>
      </Tab>
    </template>

    <!-- Spacer -->
    <div class="flex-1" />

    <!-- neuer Tab -->
    <div class="self-center mr-4.5">
      <Button
        v-if="mode === 'edit'"
        aria-label="Neuer Tab"
        icon="pi pi-plus"
        raised
        size="small"
        @click="emits('addItem')"
      />
    </div>
  </TabList>
</template>
