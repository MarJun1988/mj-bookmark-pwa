<script lang="ts" setup>
// Stores
import {computed} from "vue";
import {useDashboardStore} from "@/stores/dashboard.store.ts";
import type {Group, Tab} from "@/utils/interfaces.ts";

const dashboardStore = useDashboardStore()

// aktuell bearbeiten
const mode = computed(() => dashboardStore.mode)

/* ======================
   Emits
====================== */
const emits = defineEmits<{
  addItem: []
}>()

/* ======================
   Props
====================== */
const props = defineProps<{
  activeTab: Tab
  activeGroupId: string
  activeGroup: Group | null
}>()

</script>

<template>
  <div class="mb-3 flex items-end justify-between">
    <div>
      <div class="text-sm text-[var(--p-text-secondary-color)]">
        Kontext
      </div>
      <div class="text-xl font-semibold">
        <span>{{ props.activeTab.title }}</span>
        <span v-if="props.activeGroupId && props.activeGroup && props.activeGroup.title"> / </span>
        <span v-if="props.activeGroupId && props.activeGroup && props.activeGroup.title">{{
          props.activeGroup.title
        }}</span>
      </div>
    </div>

    <!-- neues Items -->
    <Button
      v-if="mode === 'edit'"
      aria-label="Neues Item"
      icon="pi pi-plus"
      raised
      size="small"
      @click="emits('addItem')"
    />
  </div>
</template>