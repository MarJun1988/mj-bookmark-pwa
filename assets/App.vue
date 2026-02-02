<template>
  <!-- Anzeige der Sites -->
  <div class="grid grid-nogutter" style="margin-bottom: 3rem">
    <div class="col-12">
      <router-view></router-view>
    </div>
  </div>

  <!-- Footer mit Knopf für Verwaltung -->
  <div class="fixed bottom-0 min-w-screen">
    <div class="flex gap-2 justify-content-center">
      <Button class="mb-2" icon="pi pi-arrow-up" raised rounded @click="visibleBottom = true"/>
    </div>
    <!-- Auflistung der Menü-Einträge -->
    <Sidebar v-model:visible="visibleBottom" class="z-4" header="Verwaltungsbereich" position="bottom"
             style="height: auto">
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
        <div class="flex align-items-center justify-content-center  font-bold border-round m-2">
          <router-link :to="{name: managementAreaNames.bookmarkCategoryList}">
            <Button :label="menus.mainMenu.managementArea.children.bookmarkCategory.label" :text="!route.path.includes('/bookmark-category/')" raised/>
          </router-link>
        </div>
        <div class="flex align-items-center justify-content-center font-bold border-round m-2">
          <router-link :to="{name: managementAreaNames.bookmarkList}">
            <Button :label="menus.mainMenu.managementArea.children.bookmark.label" :text="!route.path.includes('/bookmark/')" raised />
          </router-link>
        </div>
      </div>
    </Sidebar>
  </div>
  <!-- Ausgabe Meldungen -->
  <Toast/>
</template>

<script setup>
import {RouterView, useRoute} from 'vue-router';
import {ref, watch} from "vue";
import {useApiStore} from "@/stores/api";
import {storeToRefs} from "pinia";
import {useToast} from "primevue/usetoast";
import {useTranslationsStore} from "@/stores/translations";
import {mainMenuNames, managementAreaNames} from "@/router/default"; // Store - Translations

// Store - Translations
const storeTranslations = useTranslationsStore();
const {components, menus} = storeToRefs(storeTranslations);

// Store - API
const storeApi = useApiStore();
const {result} = storeToRefs(storeApi);

// Anzeige von den Menüknöpfen
const visibleBottom = ref(false);

// Messages - Toast
const toast = useToast();

const route = useRoute();


// Prüfen, ob eine Aktion per API ausgeführt wurde
watch(() => result.value.type, (newValue) => {
  let param = {
    severity: "",
    summary: "",
    detail: "",
  };
  if (newValue) {
    switch (newValue) {
      case 'added':
        param = {
          severity: "success",
          summary: components.value.toastMessage.created.title,
          detail: components.value.toastMessage.created.message,
        }
        break;
      case 'updated':
        param = {
          severity: "success",
          summary: components.value.toastMessage.updated.title,
          detail: components.value.toastMessage.updated.message,
        }
        break;
      case 'deleted':
        param = {
          severity: "success",
          summary: components.value.toastMessage.deleted.title,
          detail: components.value.toastMessage.deleted.message,
        }
        break;
      case 'failed':
        param = {
          severity: "warn",
          summary: components.value.toastMessage.failed.title,
          detail: components.value.toastMessage.failed.message,
        }
        break;
      case 'relationsFound':
        param = {
          severity: "warn",
          summary: components.value.toastMessage.relationsFound.title,
          detail: components.value.toastMessage.relationsFound.message,
        }
        break;
      default:
        param = {
          severity: "dang",
          summary: components.value.toastMessage.error.title,
          detail: components.value.toastMessage.error.message,
        }
        break;
    }

    // Doppelter Eintrag
    if (result.value.errors && result.value.errors.length > 0) {
      result.value.errors.forEach(error => {
        let element = document.getElementById(error.field);
        element.classList.add('p-invalid')
      });

      param = {
        severity: "warn",
        summary: components.value.toastMessage.failed.title,
        detail: result.value.errors[0].message,
        // detail: components.value.toastMessage.failed.message + ' ' + result.value.errors[0].message,
      }
    }

    toast.add({severity: param.severity, summary: param.summary, detail: param.detail, life: 5000});
  }
}, {
  deep: true
});
</script>

<style>
body {
  margin: 0;
  background-color: var(--primary-color-text);
  color: var(--primary-color);
}

@media screen and (min-width: 1600px) {
  .xxl\:w-2 {
    width: 16.6667% !important; /* 2 von 12 Spalten */
  }
}
</style>
