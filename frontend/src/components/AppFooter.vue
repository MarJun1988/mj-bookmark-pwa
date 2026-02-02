<script lang="ts" setup>
import { useVersionStore } from "@/stores/version.store.ts";
import { storeToRefs } from "pinia";
import { onMounted } from "vue";

const versionStore = useVersionStore();
const { lastVersion } = storeToRefs(versionStore);

/* ======================
   Props
====================== */
const props = defineProps<{
  showProjectName: boolean;
  widthClass: string;
}>();

onMounted(async () => {
  await versionStore.fetchAllItems();
});
</script>

<template>
  <div
    :class="props.widthClass"
    class="m-auto my-4 pr-5 grid grid-cols-2 items-center justify-between pl-5 mt-1"
  >
    <!-- Zur Hilfe -->
    <div class="text-sm gap-2 flex items-center justify-start">
      <i class="pi pi-question-circle" />
      <a
        href="/help"
        target="_blank"
      >Zur Hilfe</a>
    </div>
    <!-- Git Repository -->
    <div class="flex items-center gap-2 text-sm justify-end">
      <i class="pi pi-github" />
      <a
        href="https://github.com/MarJun1988/mj-bookmark-pwa"
        target="_blank"
      >
        Github
      </a>

      <span>|</span>

      <a
        href="https://github.com/MarJun1988/mj-bookmark-pwa/releases"
        target="_blank"
      >
        <span v-if="props.showProjectName"> MJ-Bookmark-PWA</span>
        {{ lastVersion?.versionNumber }}
      </a>
    </div>
  </div>
</template>
