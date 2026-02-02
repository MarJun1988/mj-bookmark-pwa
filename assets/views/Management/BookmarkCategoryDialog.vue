<template>
  <default-dialog v-if="route.path.includes('new') || route.path.includes('edit')" :fields="fieldsDefault"
                  :header-title="headerTitle"
                  :item="defaultEntry" :item-is-loading="isLoading" :showed-action-button="showedActionButton"
                  @close-dialog="closeDialog"
                  @item-add="itemAction('new')" @item-edit="itemAction('edit')"
                  @change-dialog-auto-close="dialogAutoClose = $event"
                  @change-drop-down-tab-area="changeDropDownTabArea($event)"/>

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
import {useBookmarkCategoryStore} from "@/stores/Management/bookmarkCategoryStore";

// Store - Translations
const storeTranslations = useTranslationsStore();
const {dialogs} = storeTranslations;

// Store - Einstellungen des Data Tables
const storeDataTable = useDataTableStore();
const {lastLazyParams} = storeToRefs(storeDataTable);

// Store - Tab-Area
const storeTabArea = useTabAreaStore();
const {dropdownData: tabAreaDropdown, isLoading: tabAreaIsLoading} = storeToRefs(storeTabArea);
storeTabArea.getForDropdown();

// Store - Bookmark Category
const storeBookmarkCategory = useBookmarkCategoryStore();
const {defaultEntry, isLoading, actionSuccess, dialogAutoClose} = storeToRefs(storeBookmarkCategory);

// Vue Router
const router = useRouter();
const route = useRoute();

// Bevor der Dialog angezeigt wird, prüfen, ob eine ID mitgegeben würde.
onBeforeMount(async () => {
  if (route && route.params && route.params.id) {
    await storeBookmarkCategory.getEntryById(route.params.id);
    if (await defaultEntry.value) {
      showedActionButton.value.save = true;
      showedActionButton.value.create = false;
    }
  } else {
    showedActionButton.value.save = false;
    showedActionButton.value.create = true;
    // await store.resetDefaultDataById();
  }
});

// Aktion beim Schließen des Dialoges
const closeRouteName = `${managementAreaNames.bookmarkCategoryList}`;
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
const headerTitle = ref(dialogs.bookmarkCategory.headerTitle);
// Felder im Dialog
const fieldsDefault = ref({
  // Abschnitt
  tabArea: {
    fieldType: 'dropDown',
    optionLabel: 'designation',
    optionValue: 'id',
    change: 'changeDropDownTabArea',
    cssClass: 'col-12 xl:col-6',
    autofocus: false,
    showForDelete: true,
    label: dialogs.bookmarkCategory.fields.tabArea.label,
    help: dialogs.bookmarkCategory.fields.tabArea.help,
    required: dialogs.bookmarkCategory.fields.tabArea.required,
    options: tabAreaDropdown,
    loading: tabAreaIsLoading
  },
  // Bezeichnung
  designation: {
    fieldType: 'inputText',
    cssClass: 'col-12 xl:col-6',
    autofocus: true,
    showForDelete: true,
    label: dialogs.bookmarkCategory.fields.designation.label,
    help: dialogs.bookmarkCategory.fields.designation.help,
    maxlength: dialogs.bookmarkCategory.fields.designation.maxlength,
    minlength: dialogs.bookmarkCategory.fields.designation.minlength,
    required: dialogs.bookmarkCategory.fields.designation.required
  },
  // Sortierung
  sorting: {
    fieldType: 'inputNumber',
    cssClass: 'col-12 xl:col-6',
    autofocus: false,
    showForDelete: true,
    step: 10,
    label: dialogs.bookmarkCategory.fields.sorting.label,
    help: dialogs.bookmarkCategory.fields.sorting.help,
    maxlength: dialogs.bookmarkCategory.fields.sorting.maxlength,
    minlength: dialogs.bookmarkCategory.fields.sorting.minlength,
    required: dialogs.bookmarkCategory.fields.sorting.required
  },
  // Kommentar
  comment: {
    fieldType: 'inputText',
    cssClass: 'col-12',
    autofocus: false,
    label: dialogs.bookmarkCategory.fields.comment.label,
    help: dialogs.bookmarkCategory.fields.comment.help,
    maxlength: dialogs.bookmarkCategory.fields.comment.maxlength,
    minlength: dialogs.bookmarkCategory.fields.comment.minlength,
    required: dialogs.bookmarkCategory.fields.comment.required
  }
});

// Aktionen beim Drücken des jeweiligen Knopfes
const itemAction = async (type) => {
  if (type && type === 'new') {
    await storeBookmarkCategory.addedNewEntry();
  } else if (type && type === 'edit') {
    await storeBookmarkCategory.updatedEntry();
  } else if (type && type === 'delete') {
    await storeBookmarkCategory.deletedEntry();
  }

  // Wenn erfolgreich, dann Abrufen der Tabellen Daten
  if (actionSuccess.value) {
    await storeBookmarkCategory.getForDatatable(lastLazyParams.value);
  }

  // Dialog, automatisch schließen?
  if (dialogAutoClose.value && actionSuccess.value) {
    await router.push({name: closeRouteName});
  }
};

// Beim Dropdown Tab-Area wechsel
const changeDropDownTabArea = async (event) => {
  // Abrufen der letzten Sorting Nummer
  await storeBookmarkCategory.getLastSorting(event.value);
  defaultEntry.value.sorting += fieldsDefault.value.sorting.step;
};
</script>