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
  <!--  <div-->
  <!--    :class="props.widthClass"-->
  <!--    class="m-auto my-4 pr-5 grid grid-cols-2 items-center justify-between pl-5 mt-1"-->
  <!--  >-->
  <!--    &lt;!&ndash; Zur Hilfe &ndash;&gt;-->
  <!--    <div class="text-sm gap-2 flex items-center justify-start">-->
  <!--      <i class="pi pi-question-circle" />-->
  <!--      <a-->
  <!--        href="/help"-->
  <!--        target="_blank"-->
  <!--      >Zur Hilfe</a>-->
  <!--    </div>-->
  <!--    &lt;!&ndash; Git Repository &ndash;&gt;-->
  <!--    <div class="flex items-center gap-2 text-sm justify-end">-->
  <!--      <i class="pi pi-github" />-->
  <!--      <a-->
  <!--        href="https://github.com/MarJun1988/mj-bookmark-pwa"-->
  <!--        target="_blank"-->
  <!--      >-->
  <!--        Github-->
  <!--      </a>-->

  <!--      <span>|</span>-->

  <!--      <a-->
  <!--        href="https://github.com/MarJun1988/mj-bookmark-pwa/releases"-->
  <!--        target="_blank"-->
  <!--      >-->
  <!--        <span-->
  <!--          v-if="props.showProjectName"-->
  <!--          class="hidden md:block"-->
  <!--        > MJ-Bookmark-PWA</span>-->
  <!--        {{ lastVersion?.versionNumber }}-->
  <!--      </a>-->
  <!--    </div>-->
  <!--  </div>-->
  <div
    :class="props.widthClass"
    class="m-auto my-4 px-5 mt-1 flex items-center"
  >
    <!-- Links -->
    <div class="text-sm gap-2 flex items-center">
      <i class="pi pi-question-circle" />
      <a
        href="/help"
        target="_blank"
      >Zur Hilfe</a>
    </div>

    <!-- Rechts -->
    <div class="flex items-center gap-2 text-sm ml-auto">
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
        <span
          v-if="props.showProjectName"
          class="hidden md:inline-block"
        >
          MJ-Bookmark-PWA
        </span>
        {{ lastVersion?.versionNumber }}
      </a>
    </div>
  </div>
</template>
