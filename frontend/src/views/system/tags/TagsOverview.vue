<script lang="ts" setup>
import DefaultTable from '@/components/DefaultTable.vue'
import {onUnmounted} from "vue";
import {useTagStore} from "@/stores/tag.store.ts";

// Pinia Stores
const store = useTagStore()

onUnmounted(() => {
  store.$dispose()
})
</script>

<template>
  <!--  Tabelle -->
  <DefaultTable
    :delete-disabled="false"
    :state-version="1"
    :store="store"
    state-key="dataTable-tags"
  />
</template>
