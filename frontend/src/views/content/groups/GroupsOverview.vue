<script lang="ts" setup>
import DefaultTable from "@/components/DefaultTable.vue";
import { onMounted, onUnmounted } from "vue";
import { useGroupStore } from "@/stores/group.store.ts";
import { useTabStore } from "@/stores/tab.store.ts";

// Pinia Stores
const storeGroup = useGroupStore();
const storeTab = useTabStore();

onMounted(() => {
  storeTab.fetchAllItemsForSelect();
});
onUnmounted(() => {
  storeGroup.$dispose();
});
</script>

<template>
  <!--  Tabelle -->
  <DefaultTable
    :delete-disabled="false"
    :state-version="1.4"
    state-key="dataTable-groups"
    :store="storeGroup"
  />
</template>
