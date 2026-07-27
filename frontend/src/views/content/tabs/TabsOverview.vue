<script lang="ts" setup>
import DefaultTable from "@/components/DefaultTable.vue";
import { onUnmounted } from "vue";
import { useTabStore } from "@/stores/tab.store.ts";

// Pinia Stores
const storeTab = useTabStore();

onUnmounted(() => {
  storeTab.$dispose();
});
</script>

<template>
  <!--  Tabelle -->
  <DefaultTable
    :delete-disabled="false"
    :store="storeTab"
    state-key="dataTable-tabs"
    :state-version="1.1"
  />
</template>
