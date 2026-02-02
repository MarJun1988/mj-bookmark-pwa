<script lang="ts" setup>
import { useDashboardStore } from "@/stores/dashboard.store.ts";
import { computed, type ComputedRef, type Ref, ref, watch } from "vue";
import type { Group, GroupView } from "@/utils/interfaces.ts";

import { useBreakpoint } from "@/composable/useBreakpoint.ts";
import { VueDraggable } from "vue-draggable-plus";

const dashboardStore = useDashboardStore();

// aktuell bearbeiten
const mode = computed(() => dashboardStore.mode);

/* ======================
   Props
====================== */
const props = defineProps<{
  groups: Group[] | GroupView[];
  tabId: string; // 👈 wichtig für groupsForView
}>();
/* ======================
   Emits
====================== */
const emits = defineEmits<{
  // Event ohne Parameter
  // close: []

  // Event mit einem Parameter
  openActionMenu: [event: Event, group: Group];
  addItem: [];
  // submit: [value: string]

  // Event mit mehreren Parametern
  // update: [id: number, name: string]

  reorder: [groups: { id: string; order: number }[]];
}>();

const groupsForView = computed<GroupView[]>(() => {
  return dashboardStore.groupsForView(props.tabId);
});

const sortedGroups: ComputedRef<Group[] | GroupView[]> = computed(() => {
  return [...props.groups].sort((a, b) => {
    if ((a.order ?? 0) !== (b.order ?? 0)) {
      return (a.order ?? 0) - (b.order ?? 0);
    }
    return a.title.localeCompare(b.title);
  });
});

const localGroups = ref<Group[] | GroupView[]>([]);

watch(
  () => props.groups,
  (groups) => {
    localGroups.value = [...groups].sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0),
    );
  },
  { immediate: true },
);

const previousOrder: Ref<(string | undefined)[]> = ref([]);

function onDragStart() {
  previousOrder.value = localGroups.value.map((g) => g.id);
}
type GroupOrderUpdate = {
  id: string;
  order: number;
  title: string;
  tabId: string;
};
function onDragEnd() {
  const changed: GroupOrderUpdate[] = [];

  localGroups.value.forEach((group, index) => {
    const oldIndex = previousOrder.value.indexOf(group.id);
    if (oldIndex !== index) {
      changed.push({
        id: group.id,
        order: index,
        title: group.title,
        tabId: group.tabId,
      });
    }
  });

  if (changed.length > 0) {
    console.log("changed", changed);
    emits("reorder", changed);
  }
}

watch(
  () => mode.value,
  (m) => {
    if (m === "edit") {
      localGroups.value = sortedGroups.value.map((g) => ({ ...g }));
    }
  },
  { immediate: true },
);

// const activeGroupId = computed(() => {
//   if (dashboardStore.activeGroupId === "") {
//     return null;
//   } else {
//     return dashboardStore.activeGroupId;
//   }
// });

function selectGroup(groupId: string | null | undefined) {
  if (groupId !== undefined) {
    dashboardStore.setActiveGroup(groupId);
    dashboardStore.closeGroupSheet();
  }
}

const { isMobile } = useBreakpoint();

const activeGroup = computed(() => {
  if (dashboardStore.activeGroupId === null) return null;

  return (
    props.groups.find((g) => g.id === dashboardStore.activeGroupId) ?? null
  );
});

const onUpdate = () => {
  console.log("update");
};
</script>

<template>
  <div
    class="mb-4 flex flex-wrap items-center gap-2 sm:flex-nowrap sm:overflow-x-auto"
  >
    <template v-if="mode === 'edit'">
      <VueDraggable
        ref="el"
        v-model="localGroups"
        :animation="150"
        class="flex flex-wrap gap-2"
        ghostClass="opacity-40"
        @end="onDragEnd"
        @start="onDragStart"
        @update="onUpdate"
      >
        <template
          v-for="group in localGroups"
          :key="group.id"
        >
          <div class="flex items-center gap-1">
            <Button
              :severity="
                group.id === dashboardStore.activeGroupId
                  ? 'primary'
                  : 'secondary'
              "
              class="shrink-0 px-4 py-2 text-sm rounded-lg transition whitespace-nowrap"
              rounded
              size="small"
              @click="selectGroup(group.id)"
            >
              <span
                class="line-clamp-2 wrap-break-word leading-tight text-center"
              >
                {{ group.title }}
              </span>
            </Button>

            <Button
              class="shrink-0 opacity-60 hover:opacity-100"
              icon="pi pi-ellipsis-v"
              rounded
              size="small"
              text
              @click="emits('openActionMenu', $event, group as any)"
            />
          </div>
        </template>
      </VueDraggable>
    </template>

    <template v-else>
      <!-- HEADER TRIGGER -->
      <div class="flex items-center gap-2">
        <!-- MOBILE -->
        <button
          v-if="isMobile"
          class="flex items-center gap-2 font-semibold"
          @click="dashboardStore.openGroupSheet"
        >
          {{ activeGroup?.title ?? "Alle" }}
          <i class="pi pi-chevron-down text-xs opacity-60" />
        </button>

        <!-- DESKTOP -->
        <div
          v-else
          class="flex gap-2 overflow-x-auto scrollbar-hide p-2"
        >
          <!-- Alle -->
          <Button
            :severity="
              dashboardStore.activeGroupId === null ? 'primary' : 'secondary'
            "
            class="shrink-0 px-4 py-2 text-sm rounded-lg transition whitespace-nowrap"
            label="Alle"
            size="small"
            @click="selectGroup(null)"
          />

          <Button
            v-for="group in groupsForView"
            :key="group.id"
            :disabled="group.__skeleton"
            :severity="
              group.__skeleton
                ? 'secondary'
                : group.id === dashboardStore.activeGroupId
                  ? 'primary'
                  : 'secondary'
            "
            size="small"
            class="shrink-0 px-4 py-2 text-sm rounded-lg transition whitespace-nowrap"
            @click="!group.__skeleton && selectGroup(group.id)"
          >
            <Skeleton
              v-if="group.__skeleton"
              class="min-w-16 min-h-4"
            />
            <span v-else>
              {{ group.title }}
            </span>
          </Button>
        </div>
      </div>

      <!-- MOBILE BOTTOM SHEET -->
      <Drawer
        v-model:visible="dashboardStore.isGroupSheetOpen"
        :style="{ height: '70vh' }"
        class="rounded-t-2xl"
        position="bottom"
      >
        <div class="space-y-2">
          <h3 class="text-sm font-semibold opacity-70 mb-3">
            Gruppen – {{ dashboardStore.activeTab?.title }}
          </h3>
          <!-- Alle -->
          <Button
            :severity="
              dashboardStore.activeGroupId === null ? 'primary' : 'secondary'
            "
            class="group-row"
            label="Alle"
            size="small"
            @click="selectGroup(null)"
          />
          <Button
            v-for="group in groupsForView"
            :key="group.id"
            :disabled="group.__skeleton"
            size="small"
            :severity="
              group.id === dashboardStore.activeGroupId
                ? 'primary'
                : 'secondary'
            "
            class="group-row"
            @click="!group.__skeleton && selectGroup(group.id)"
          >
            <Skeleton
              v-if="group.__skeleton"
              height="1rem"
              width="6rem"
            />
            <span v-else>
              {{ group.title }}
            </span>
          </Button>
        </div>
      </Drawer>
    </template>

    <!-- Spacer (nur Desktop sinnvoll) -->
    <div class="hidden sm:flex flex-1" />

    <!-- neue Gruppe -->
    <Button
      v-if="mode === 'edit'"
      aria-label="Neue Gruppe"
      icon="pi pi-plus"
      raised
      size="small"
      @click="emits('addItem')"
    />
  </div>
</template>
