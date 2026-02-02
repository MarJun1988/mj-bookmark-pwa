<script lang="ts" setup>
import { onMounted, ref, type Ref, watch } from "vue";
import { useAuthStore } from "@/stores/auth.store.ts";
import { storeToRefs } from "pinia";
import AppTopBar from "@/components/AppTopBar.vue";
import { useToast } from "primevue/usetoast";
import { useToastStore } from "@/stores/toast.store.ts";
import { useVersionStore } from "@/stores/version.store.ts";
import { wsLink } from "@/apollo/links/ws.ts";
import OfflineBar from "@/components/OfflineBar.vue";
import { devLog } from "@/utils/utils.ts";
import DevBar from "@/components/DevBar.vue";

const auth = useAuthStore();

const toast = useToast();
const toastStore = useToastStore();

onMounted(async () => {
  await auth.bootstrap();
  toastStore.register(toast);
  await versionStore.fetchAllItems();
});

const isDev: Ref<boolean> = ref(false);

if (import.meta.env.DEV) {
  isDev.value = true;
}

const versionStore = useVersionStore();
const { lastVersion } = storeToRefs(versionStore);
watch(
  () => auth.accessToken,
  (token, prev) => {
    if (token && token !== prev) {
      wsLink?.client?.dispose(); // erzwingt neuen connection_init
      wsLink?.client?.subscribe(
        { query: "subscription { __typename }" },
        {
          next: (value) => {
            devLog("WS keepalive", value);
          },
          error: (err) => {
            devLog("WS error", err);
          },
          complete: () => {
            devLog("WS completed");
          },
        },
      );
    }
  },
);
</script>

<template>
  <Toast position="bottom-right" />
  <ConfirmDialog />

  <DevBar v-if="isDev" />
  <OfflineBar />
  <div
    v-if="auth.isAuthenticated"
    class="min-h-screen flex flex-col bg-(--p-surface-ground)"
  >
    <!-- TopBar -->
    <header class="flex items-center pb-5 sticky top-0 z-100">
      <AppTopBar v-if="auth.isAuthenticated" />
    </header>

    <!-- Hauptbereich -->
    <main class="flex-1 flex flex-col overflow-hidden m-auto w-11/12">
      <Card
        :pt:body="'bg-[var(--p-surface-section)] rounded-2xl'"
        :pt:content="'bg-[var(--p-surface-section)]'"
        class="flex-1 flex flex-col overflow-hidden bg-(--p-surface-section)"
      >
        <template #content>
          <div
            v-if="!auth.isReady"
            class="p-6 text-center bg-[var(--p-surface-section"
          >
            Loading…
          </div>
          <!-- Hauptanzeige Bereich -->
          <RouterView v-if="auth.isAuthenticated" />
        </template>
      </Card>
    </main>

    <!-- Global Footer (optional) -->
    <footer
      class="w-11/12 m-auto my-4 pr-5 grid grid-cols-1 md:grid-cols-2 items-center justify-between pl-5 pt-1"
    >
      <!-- Zur Hilfe -->
      <div
        class="text-sm gap-2 flex items-center justify-center w-full md:justify-start"
      >
        <i class="pi pi-question-circle" />
        <a
          href="/help"
          target="_blank"
        >Zur Hilfe</a>
      </div>
      <!-- Git Repository -->
      <div
        class="flex items-center justify-center gap-2 text-sm w-full md:justify-end"
      >
        <svg
          class="h-5"
          viewBox="0 0 128 128"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="m124.755 51.382-.177-.452L107.47 6.282a4.459 4.459 0 0 0-1.761-2.121 4.581 4.581 0 0
          0-5.236.281 4.578 4.578 0 0 0-1.518 2.304L87.404 42.088H40.629L29.077 6.746a4.492 4.492 0
          0 0-1.518-2.31 4.581 4.581 0 0 0-5.236-.281 4.502 4.502 0 0 0-1.761 2.121L3.422
          50.904l-.17.452c-5.059 13.219-.763 28.192 10.537 36.716l.059.046.157.111 26.061 19.516
          12.893 9.758 7.854 5.93a5.283 5.283 0 0 0 6.388 0l7.854-5.93 12.893-9.758
          26.218-19.634.065-.052c11.273-8.526 15.562-23.472 10.524-36.677z"
            fill="#E24329"
          />
          <path
            d="m124.755 51.382-.177-.452a57.79 57.79 0 0 0-23.005 10.341L64 89.682c12.795 9.68 23.934 18.09 23.934 18.09l26.218-19.634.065-.052c11.291-8.527 15.586-23.488 10.538-36.704z"
            fill="#FC6D26"
          />
          <path
            d="m40.066 107.771 12.893 9.758 7.854 5.93a5.283 5.283 0 0 0 6.388 0l7.854-5.93 12.893-9.758s-11.152-8.436-23.947-18.09a18379.202 18379.202 0 0 0-23.935 18.09z"
            fill="#FCA326"
          />
          <path
            d="M26.42 61.271A57.73 57.73 0 0 0 3.422 50.904l-.17.452c-5.059 13.219-.763 28.192 10.537 36.716l.059.046.157.111 26.061 19.516L64 89.655 26.42 61.271z"
            fill="#FC6D26"
          />
        </svg>

        <a
          href="https://gitlab.com/MarJun1988/mj-bookmark-pwa"
          target="_blank"
        >
          GitLab
        </a>

        <span>|</span>

        <a
          href="https://gitlab.com/MarJun1988/mj-bookmark-pwa/-/releases"
          target="_blank"
        >
          MJ-Bookmark {{ lastVersion?.versionNumber }}
        </a>
      </div>
    </footer>
  </div>

  <router-view
    v-if="!auth.isAuthenticated"
    name="loginView"
  />
</template>
