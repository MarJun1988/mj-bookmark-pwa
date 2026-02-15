<script lang="ts" setup>
import DefaultTable from "@/components/DefaultTable.vue";
import { onMounted, onUnmounted } from "vue";
import { useItemStore } from "@/stores/item.store.ts";
import { useTabStore } from "@/stores/tab.store.ts";
import { useGroupStore } from "@/stores/group.store.ts";
import { useTagStore } from "@/stores/tag.store.ts";

// Pinia Stores
const storeTab = useTabStore();
const storeGroup = useGroupStore();
const storeItem = useItemStore();
const storeTag = useTagStore();

onMounted(() => {
  storeTab.fetchAllItemsForSelect();
  storeGroup.fetchAllItemsForSelect();
  storeTag.fetchAllItemsForSelect();
});

onUnmounted(() => {
  storeItem.$dispose();
});
</script>

<template>
  <!--  Tabelle -->
  <DefaultTable
    :not-show-action-button="{ refreshFavicon: false }"
    :delete-disabled="false"
    :state-version="1.3"
    :store="storeItem"
    state-key="dataTable-items"
    @refresh-favicons="storeItem.refreshFavicons()"
  />
</template>
