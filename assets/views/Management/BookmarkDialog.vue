<template>
  <default-dialog v-if="route.path.includes('new') || route.path.includes('edit')" :fields="fieldsDefault"
                  :header-title="headerTitle"
                  :item="defaultEntry" :item-is-loading="isLoading" :showed-action-button="showedActionButton"
                  @get-site-title="fetchSiteTitle($event)"
                  @close-dialog="closeDialog" @item-add="itemAction('new')"
                  @item-edit="itemAction('edit')"
                  @change-dialog-auto-close="dialogAutoClose = $event" @change-drop-down-tab-area="changeDropDownTabArea($event)"
                  @change-drop-down-bookmark-category="changeDropDownBookmarkCategory($event)"/>

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
import {useBookmarkStore} from "@/stores/Management/bookmarkStore";

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
const {dropdownData: bookmarkCategoryDropdown, isLoading: bookmarkCategoryIsLoading} = storeToRefs(storeBookmarkCategory);

// Store - Bookmark
const storeBookmark = useBookmarkStore();
const {defaultEntry, isLoading, actionSuccess, dialogAutoClose} = storeToRefs(storeBookmark);

// Vue Router
const router = useRouter();
const route = useRoute();

// Bevor der Dialog angezeigt wird, prüfen, ob eine ID mitgegeben würde.
onBeforeMount(async () => {
  if (route && route.params && route.params.id) {
    await storeBookmark.getEntryById(route.params.id);
    if (await defaultEntry.value) {
      await storeBookmarkCategory.getForDropdown(defaultEntry.value.tabArea.id);
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
const closeRouteName = `${managementAreaNames.bookmarkList}`;
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
const headerTitle = ref(dialogs.bookmark.headerTitle);
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
    label: dialogs.bookmark.fields.tabArea.label,
    help: dialogs.bookmark.fields.tabArea.help,
    required: dialogs.bookmark.fields.tabArea.required,
    options: tabAreaDropdown,
    loading: tabAreaIsLoading
  },
  // Lesezeichen Kategorie
  bookmarkCategory: {
    fieldType: 'dropDown',
    optionLabel: 'designation',
    optionValue: 'id',
    change: 'changeDropDownBookmarkCategory',
    cssClass: 'col-12 xl:col-6',
    autofocus: false,
    showForDelete: true,
    label: dialogs.bookmark.fields.bookmarkCategory.label,
    help: dialogs.bookmark.fields.bookmarkCategory.help,
    required: dialogs.bookmark.fields.bookmarkCategory.required,
    options: bookmarkCategoryDropdown,
    loading: bookmarkCategoryIsLoading
  },
  // URL
  hyperlinkUrl: {
    fieldType: 'inputText',
    cssClass: 'col-12 xl:col-6',
    autofocus: true,
    showForDelete: true,
    onFocusOut: 'getSiteTitle',
    label: dialogs.bookmark.fields.hyperlinkUrl.label,
    help: dialogs.bookmark.fields.hyperlinkUrl.help,
    maxlength: dialogs.bookmark.fields.hyperlinkUrl.maxlength,
    minlength: dialogs.bookmark.fields.hyperlinkUrl.minlength,
    required: dialogs.bookmark.fields.hyperlinkUrl.required
  },
  // Bezeichnung
  hyperlinkDescription: {
    fieldType: 'inputText',
    cssClass: 'col-12 xl:col-6',
    autofocus: true,
    showForDelete: true,
    label: dialogs.bookmark.fields.hyperlinkDescription.label,
    help: dialogs.bookmark.fields.hyperlinkDescription.help,
    maxlength: dialogs.bookmark.fields.hyperlinkDescription.maxlength,
    minlength: dialogs.bookmark.fields.hyperlinkDescription.minlength,
    required: dialogs.bookmark.fields.hyperlinkDescription.required
  },
  // Sortierung
  sorting: {
    fieldType: 'inputNumber',
    cssClass: 'col-12 xl:col-6',
    autofocus: false,
    showForDelete: true,
    step: 10,
    label: dialogs.bookmark.fields.sorting.label,
    help: dialogs.bookmark.fields.sorting.help,
    maxlength: dialogs.bookmark.fields.sorting.maxlength,
    minlength: dialogs.bookmark.fields.sorting.minlength,
    required: dialogs.bookmark.fields.sorting.required
  },
  // Kommentar
  comment: {
    fieldType: 'inputText',
    cssClass: 'col-12',
    autofocus: false,
    label: dialogs.bookmark.fields.comment.label,
    help: dialogs.bookmark.fields.comment.help,
    maxlength: dialogs.bookmark.fields.comment.maxlength,
    minlength: dialogs.bookmark.fields.comment.minlength,
    required: dialogs.bookmark.fields.comment.required
  }
});

// Aktionen beim Drücken des jeweiligen Knopfes
const itemAction = async (type) => {
  if (type && type === 'new') {
    await storeBookmark.addedNewEntry();
  } else if (type && type === 'edit') {
    await storeBookmark.updatedEntry();
  } else if (type && type === 'delete') {
    await storeBookmark.deletedEntry();
  }

  // WEnn erfolgreich, dann Abrufen der Tabellen Daten
  if (actionSuccess.value) {
    await storeBookmark.getForDatatable(lastLazyParams.value);
  }

  // Dialog, automatisch schließen?
  if (dialogAutoClose.value && actionSuccess.value) {
    await router.push({name: closeRouteName});
  }
};

// Beim Dropdown Tab-Area wechsel
const changeDropDownTabArea = async (event) => {
  await storeBookmarkCategory.getForDropdown(event.value);
};

// Beim Dropdown Bookmark-Category wechsel
const changeDropDownBookmarkCategory = async (event) => {
  // Abrufen der letzten Sorting Nummer
  await storeBookmark.getLastSorting(event.value);
  defaultEntry.value.sorting += fieldsDefault.value.sorting.step;
}

// Seitentitel abrufen
const fetchSiteTitle = async (event) => {
  if (event) {
    await storeBookmark.getSiteTitle();


    //
    // const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
    // try {
    //   const response = await axios.get(proxyUrl + defaultEntry.value.hyperlinkUrl);
    //   const html = response.data;
    //   const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    //   if (titleMatch) {
    //     defaultEntry.value.hyperlinkDescription = titleMatch[1];
    //   } else {
    //   }
    // } catch (error) {
    //   console.error('Fehler beim Abrufen der Webseite:', error);
    //   defaultEntry.value.hyperlinkDescription  = 'Kein Titel gefunden!';
    // }
  }
};

</script>