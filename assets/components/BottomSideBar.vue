<template>
  <!-- Footer mit Knopf für Verwaltung -->
  <div class="fixed bottom-0 min-w-screen">
    <div class="flex gap-2 justify-content-center">
      <Button class="mb-2" icon="pi pi-arrow-up" raised rounded @click="visibleBottom = true"/>
    </div>
    <!-- Auflistung der Menü-Einträge -->
    <Sidebar v-model:visible="visibleBottom" class="z-4" header="Verwaltungsbereich" position="bottom"
             style="height: auto">
      <template #header>
        <div class="flex align-items-center gap-2">
          <Button v-tooltip="'Daten abrufen erzwingen'" aria-label="Force Reload" icon="pi pi-sync" raised rounded severity="danger" text @click="forceReload"/>
          <span class="font-bold ml-2">Verwaltungsbereich</span>
        </div>
      </template>
      <div class="flex justify-content-evenly flex-wrap">
        <div class="flex align-items-center justify-content-center font-bold border-round m-2">
          <router-link :to="{name: mainMenuNames.dashboard }">
            <Button :label="menus.mainMenu.dashboard.label" :text="!route.path.includes('/dashboard')" raised/>
          </router-link>
        </div>
        <div class="flex align-items-center justify-content-center font-bold border-round m-2">
          <router-link :to="{name: managementAreaNames.tabAreaList}">
            <Button :label="menus.mainMenu.managementArea.children.tabArea.label" :text="!route.path.includes('/tab-area/')" raised/>
          </router-link>
        </div>
        <div class="flex align-items-center justify-content-center font-bold border-round m-2">
          <router-link :to="{name: managementAreaNames.bookmarkCategoryList}">
            <Button :label="menus.mainMenu.managementArea.children.bookmarkCategory.label" :text="!route.path.includes('/bookmark-category/')" raised/>
          </router-link>
        </div>
        <div class="flex align-items-center justify-content-center font-bold border-round m-2">
          <router-link :to="{name: managementAreaNames.bookmarkList}">
            <Button :label="menus.mainMenu.managementArea.children.bookmark.label" :text="!route.path.includes('/bookmark/')" raised/>
          </router-link>
        </div>
      </div>
    </Sidebar>
  </div>
</template>

<script setup>
import {mainMenuNames, managementAreaNames} from "@/router/default";
import {storeToRefs} from "pinia";
import {useTranslationsStore} from "@/stores/translations";
import {useRoute} from "vue-router";
import {ref} from "vue";

// Store - Translations
const storeTranslations = useTranslationsStore();
const {menus} = storeToRefs(storeTranslations);

// Anzeige von den Menüknöpfen
const visibleBottom = ref(true);

const route = useRoute();

const CACHE_NAME = 'my-cache-v1';

// Funktion zum Aktualisieren des Service Workers
async function updateServiceWorker() {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.register('/service-worker.js');
    await registration.update();
  }
}

// Funktion zum erzwingen des Neuladens
function forceReload() {
  // Aktualisiere den Service Worker
  updateServiceWorker();
  // Führe einen erzwungenen Neustart durch, indem die Seite neu geladen wird
  window.location.reload(true);
}

// const forceReload = async () => {
//   if ('serviceWorker' in navigator) {
//     // Registriere den Service Worker neu, um ihn zu aktualisieren
//     navigator.serviceWorker.getRegistrations().then(registrations => {
//       registrations.forEach(registration => {
//         registration.update();
//       });
//     });
//   }
//   // Führe einen erzwungenen Neustart durch, indem die Seite neu geladen wird
//   window.location.reload(true);
// };
</script>

<style scoped>

</style>