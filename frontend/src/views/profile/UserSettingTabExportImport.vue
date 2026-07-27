<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import { apolloClient } from "../../apollo/client";
import { EXPORT_BOOKMARKS } from "../../graphql/queries/me";
import { IMPORT_BOOKMARKS } from "../../graphql/mutations/importBookmarks";
import { useMutation } from "@vue/apollo-composable";

import { useAuthStore } from "@/stores/auth.store";
import { useUserStore } from "@/stores/user.store";
import { useDashboardStore } from "../../stores/dashboard.store";
import { useCommonStore } from "../../stores/common.store";
import { useToastStore } from "../../stores/toast.store";

// Stores
const authStore = useAuthStore();
const userStore = useUserStore();
const dashboardStore = useDashboardStore();
const common = useCommonStore();
const toastStore = useToastStore();

// State
const importMode = ref<"APPEND" | "REPLACE">("REPLACE");
const importResult = ref<null | {
  importedTabs: number;
  importedGroups: number;
  importedItems: number;
  skippedItems: number;
  createdTags: number;
}>(null);

const stats = computed(() => dashboardStore.stats);

// GraphQL Mutation
const { mutate: importBookmarks, loading: importLoading } = useMutation(IMPORT_BOOKMARKS);

// Load initial dashboard stats
onMounted(async () => {
  if (authStore.user?.id) {
    await userStore.fetchOnlyItem(authStore.user.id);
  }
  await dashboardStore.loadDashboardOnline();
});

// --------------------
// EXPORT
// --------------------
const exportData = async () => {
  common.startLoading();

  try {
    const { data } = await apolloClient.query({
      query: EXPORT_BOOKMARKS,
      fetchPolicy: "no-cache",
    });

    const json = JSON.stringify(data.exportBookmarks, null, 2);

    const blob = new Blob([json], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `bookmarks-export-${new Date().toISOString().split("T")[0]}.json`;
    link.click();

    window.URL.revokeObjectURL(url);

    toastStore.success({
      summary: "Export erfolgreich",
      detail: "Der Download wurde gestartet.",
    });
  } catch (err: any) {
    toastStore.error({
      summary: "Fehler beim Exportieren",
      detail: err?.message ?? "Unbekannter Fehler",
    });
  } finally {
    common.stopLoading();
  }
};

// --------------------
// IMPORT
// --------------------
const onFileSelect = async (event: any) => {
  const file = event.files?.[0];
  if (!file) return;

  importResult.value = null;
  common.startLoading();

  const reader = new FileReader();

  reader.onload = async (e: any) => {
    try {
      const raw = e.target.result;

      const result = await importBookmarks({
        input: {
          json: raw,
          mode: importMode.value,
        },
      });

      importResult.value = result?.data?.importBookmarks ?? null;

      toastStore.success({
        summary: "Import erfolgreich",
        detail: "Deine Daten wurden erfolgreich importiert.",
      });

      await dashboardStore.loadDashboardOnline();

      setTimeout(() => {
        importResult.value = null;
      }, 10000);
    } catch (err: any) {
      toastStore.error({
        summary: "Fehler beim Importieren",
        detail: err?.message ?? "Unbekannter Fehler",
      });
    } finally {
      common.stopLoading();
    }
  };

  reader.readAsText(file);
};
</script>

<template>
  <div class="space-y-6">
    <h2 class="text-3xl font-semibold text-center">Import & Export</h2>

    <p class="text-center text-muted-color">
      Hier kannst du deine Tabs, Gruppen und Einträge exportieren oder aus einer JSON-Datei
      importieren.
    </p>

    <div class="grid grid-cols-2 gap-4">
      <!-- Export als JSON -->
      <div class="col-span-1">
        <div class="flex justify-center">
          <Button
            icon="pi pi-download"
            label="Daten exportieren"
            :loading="common.isLoading"
            :disabled="common.isLoading"
            class="m-2"
            @click="exportData"
          />
        </div>

        <!-- CURRENT DATA -->
        <div class="border rounded-lg p-4 md:min-h-50 lg:min-h-40">
          <p class="font-semibold mb-2">Aktueller Datenbestand</p>
          <ul class="list-disc ml-6 space-y-1">
            <li>
              <b>{{ stats.tabs }}</b> Tabs
            </li>
            <li>
              <b>{{ stats.groups }}</b> Gruppen
            </li>
            <li>
              <b>{{ stats.items }}</b> Einträge
            </li>
          </ul>
        </div>
      </div>

      <!-- Import als JSON -->
      <div class="col-span-1">
        <div class="flex justify-center">
          <FileUpload
            mode="basic"
            accept="application/json"
            customUpload
            :auto="true"
            chooseLabel="JSON auswählen"
            :disabled="importLoading"
            class="m-2"
            @select="onFileSelect"
          />
        </div>

        <!-- IMPORT MODE -->
        <div class="border rounded-lg p-4 md:min-h-50 lg:min-h-40">
          <p class="font-semibold mb-3 text-center">Für den Import auswählen:</p>

          <div class="flex justify-center gap-6">
            <div class="flex items-center gap-2">
              <RadioButton v-model="importMode" value="APPEND" inputId="append" />
              <label for="append"> An bestehende Daten anfügen </label>
            </div>

            <div class="flex items-center gap-2">
              <RadioButton v-model="importMode" value="REPLACE" inputId="replace" />
              <label for="replace" class="text-red-500 font-semibold">
                Bestehende Daten vollständig ersetzen
              </label>
            </div>
          </div>

          <Message
            v-if="importMode === 'REPLACE'"
            severity="warn"
            class="mt-3"
            icon="pi pi-info-circle"
          >
            Alle bestehenden Tabs, Gruppen und Einträge werden gelöscht.
          </Message>
        </div>
        <!-- IMPORT RESULT -->
        <Transition
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="opacity-0 translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 translate-y-2"
        >
          <div v-if="importResult" class="border rounded-lg p-4 mt-4">
            <p class="font-semibold mb-2">Import-Ergebnis</p>
            <ul class="list-disc ml-6 space-y-1">
              <li>
                ✔ <b>{{ importResult.importedTabs }}</b> Tabs importiert
              </li>
              <li>
                ✔ <b>{{ importResult.importedGroups }}</b> Gruppen importiert
              </li>
              <li>
                ✔ <b>{{ importResult.importedItems }}</b> Einträge importiert
              </li>
              <li>
                ⚠ <b>{{ importResult.skippedItems }}</b> übersprungen (Duplikate)
              </li>
              <li>
                ➕ <b>{{ importResult.createdTags }}</b> neue Tags erstellt
              </li>
            </ul>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>
