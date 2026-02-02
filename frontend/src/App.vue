<script lang="ts" setup>
import { onMounted, ref, type Ref, watch } from "vue";
import { useAuthStore } from "@/stores/auth.store.ts";
import AppTopBar from "@/components/AppTopBar.vue";
import { useToast } from "primevue/usetoast";
import { useToastStore } from "@/stores/toast.store.ts";
import { wsLink } from "@/apollo/links/ws.ts";
import OfflineBar from "@/components/OfflineBar.vue";
import { devLog } from "@/utils/utils.ts";
import DevBar from "@/components/DevBar.vue";
import AppFooter from "@/components/AppFooter.vue";

const auth = useAuthStore();

const toast = useToast();
const toastStore = useToastStore();

onMounted(async () => {
  await auth.bootstrap();
  toastStore.register(toast);
});

const isDev: Ref<boolean> = ref(false);

if (import.meta.env.DEV) {
  isDev.value = true;
}

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
    <AppFooter
      :show-project-name="true"
      width-class="w-11/12"
    />
  </div>

  <router-view
    v-if="!auth.isAuthenticated"
    name="loginView"
  />
</template>
