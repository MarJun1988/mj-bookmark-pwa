<script lang="ts" setup>
import { onMounted } from "vue";
import { useDashboardStore } from "@/stores/dashboard.store";
import NavigationTabs from "@/components/NavigationTabs.vue";
const dashboardStore = useDashboardStore();

onMounted(async () => {
  await dashboardStore.bootstrapDashboard();
});
</script>
<template>
  <!-- Navigationsleiste -->
  <NavigationTabs class="sticky top-0 z-5 mb-5 bg-(--p-surface-section)" parent-name="profile" />

  <router-view />
</template>
