<script lang="ts" setup>
import DefaultTable from '@/components/DefaultTable.vue'
import {useVersionStore} from "@/stores/version.store.ts";

// Pinia Stores
const store = useVersionStore()
</script>

<template>
  <!--  Tabelle -->
  <DefaultTable
    :delete-disabled="false"
    :not-show-action-button="{create: true, update: true, delete: true}"
    :store="store"
    state-key="dataTable-versions"
    :state-version="1"
  />
</template>
