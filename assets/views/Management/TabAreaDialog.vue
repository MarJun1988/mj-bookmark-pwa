<template>
  <default-dialog v-if="route.path.includes('new') || route.path.includes('edit')" :fields="fieldsDefault"
                  :header-title="headerTitle"
                  :item="defaultEntry" :item-is-loading="isLoading" :showed-action-button="showedActionButton"
                  @close-dialog="closeDialog"
                  @item-add="itemAction('new')" @item-edit="itemAction('edit')"
                  @change-dialog-auto-close="dialogAutoClose = $event"/>

  <default-dialog-delete v-else :header-title="headerTitle" :item="defaultEntry"
                         :view-delete-fields="fieldsDefault" @close-dialog="closeDialog"
                         @item-delete="itemAction('delete')"/>
</template>

<script setup>
import DefaultDialog from "@/components/DefaultDialog.vue";
import {managementAreaNames} from "@/router/default";
import {useRoute, useRouter} from "vue-router";
import {onBeforeMount, ref} from "vue";
import {useTranslationsStore} from "@/stores/translations";
import {useTabAreaStore} from "@/stores/Management/tabAreaStore";
import {storeToRefs} from "pinia";
import {useDataTableStore} from "@/stores/dataTable";
import DefaultDialogDelete from "@/components/DefaultDialogDelete.vue";

// Store - Translations
const storeTranslations = useTranslationsStore();
const {dialogs} = storeTranslations;

// Store - Einstellungen des Data Tables
const storeDataTable = useDataTableStore();
const {lastLazyParams} = storeToRefs(storeDataTable);

// Store - Tab-Area
const storeTabArea = useTabAreaStore();
const {defaultEntry, isLoading, actionSuccess, dialogAutoClose} = storeToRefs(storeTabArea);

// Vue Router
const router = useRouter();
const route = useRoute();

// Bevor der Dialog angezeigt wird, prüfen, ob eine ID mitgegeben würde.
onBeforeMount(async () => {
  if (route && route.params && route.params.id) {
    await storeTabArea.getEntryById(route.params.id);
    if (await defaultEntry.value) {
      showedActionButton.value.save = true;
      showedActionButton.value.create = false;
    }
  } else {
    // Abrufen der letzten Sorting Nummer
    await storeTabArea.getLastSorting();
    defaultEntry.value.sorting += fieldsDefault.value.sorting.step;
    showedActionButton.value.save = false;
    showedActionButton.value.create = true;
    // await store.resetDefaultDataById();
  }
});

// Aktion beim Schließen des Dialoges
const closeRouteName = `${managementAreaNames.tabAreaList}`;
const closeDialog = () => {
  router.push({name: closeRouteName})
};

// Dialog - Einblenden bzw. Ausblenden
// Wichtig sonst reagiert er nicht beim klick auf das "x"
const show = ref(true);

// Welcher Knopf soll im Dialog angezeigt werden
const showedActionButton = ref({
  create: false,
  save: false
});

// Titel des Dialoges
const headerTitle = ref(dialogs.tabArea.headerTitle);
// Felder im Dialog
const fieldsDefault = ref({
  // Bezeichnung
  designation: {
    fieldType: 'inputText',
    cssClass: 'col-12 xl:col-6',
    autofocus: true,
    showForDelete: true,
    label: dialogs.tabArea.fields.designation.label,
    help: dialogs.tabArea.fields.designation.help,
    maxlength: dialogs.tabArea.fields.designation.maxlength,
    minlength: dialogs.tabArea.fields.designation.minlength,
    required: dialogs.tabArea.fields.designation.required
  },
  // Sortierung
  sorting: {
    fieldType: 'inputNumber',
    cssClass: 'col-12 xl:col-6',
    autofocus: false,
    showForDelete: true,
    step: 10,
    label: dialogs.tabArea.fields.sorting.label,
    help: dialogs.tabArea.fields.sorting.help,
    maxlength: dialogs.tabArea.fields.sorting.maxlength,
    minlength: dialogs.tabArea.fields.sorting.minlength,
    required: dialogs.tabArea.fields.sorting.required
  },
  // Kommentar
  comment: {
    fieldType: 'inputText',
    cssClass: 'col-12',
    autofocus: false,
    label: dialogs.tabArea.fields.comment.label,
    help: dialogs.tabArea.fields.comment.help,
    maxlength: dialogs.tabArea.fields.comment.maxlength,
    minlength: dialogs.tabArea.fields.comment.minlength,
    required: dialogs.tabArea.fields.comment.required
  }
});

// Aktionen beim Drücken des jeweiligen Knopfes
const itemAction = async (type) => {
  if (type && type === 'new') {
    await storeTabArea.addedNewEntry();
  }
  else if (type && type === 'edit') {
    await storeTabArea.updatedEntry();
  }
  else if (type && type === 'delete') {
    await storeTabArea.deletedEntry();
  }

  // Wenn erfolgreich, dann Abrufen der Tabellen Daten
  if (actionSuccess.value) {
    await storeTabArea.getForDatatable(lastLazyParams.value);
  }

  // Dialog, automatisch schließen?
  if (dialogAutoClose.value && actionSuccess.value) {
    await router.push({name: closeRouteName});
  }
};
</script>