<script lang="ts" setup>
import NavigationTabs from "@/components/NavigationTabs.vue";

// const store = useVersionStore()
// const {lastVersion} = storeToRefs(store)

// onMounted(async () => {
//   await store.fetchAllItems()
// })

</script>

<template>
  <!-- Navigationsleiste -->
  <NavigationTabs
    class="sticky top-0 z-5 mb-5 bg-(--p-surface-section)"
    parent-name="system"
  />

  <router-view />

  <!--  Dialogfelder -->
  <router-view name="dialog" />
</template>

<style scoped></style>
