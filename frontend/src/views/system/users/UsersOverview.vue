<script lang="ts" setup>
import DefaultTable from "@/components/DefaultTable.vue";
import { useUserStore } from "@/stores/user.store.ts";
import { onUnmounted } from "vue";

// Pinia Stores
const store = useUserStore();

onUnmounted(() => {
  store.$dispose();
});
</script>

<template>
  <!--  Tabelle -->
  <DefaultTable
    :delete-disabled="false"
    :store="store"
    state-key="dataTable-users"
    :state-version="1.2"
  />
</template>
