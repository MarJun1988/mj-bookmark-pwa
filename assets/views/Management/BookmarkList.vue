<template>
  <div class=" text-center">
    <h2>{{ headerText }}</h2>
  </div>
  <default-table :columns="tableColumnsDefault" :data-for-table="datatableData" :data-total-count="datatableCount"
                 :filters="tableFilters"
                 :global-filter-fields="globalFilterFields" :header-text="headerText"
                 :loading="isLoading"
                 :multi-sort-meta="multiSortMeta"
                 :view-selected-columns="true"
                 @item-add="actionOnButton('new')"
                 @item-edit="actionOnButton('edit', $event.id)"
                 @item-delete="actionOnButton('delete', $event.id)"
                 @fetch-data="fetch($event)"
  />
</template>
<script setup>
import {storeToRefs} from "pinia";
import DefaultTable from "@/components/DefaultTable.vue";
import {FilterMatchMode} from "primevue/api";
import {ref} from "vue";
import {managementAreaNames} from "@/router/default";
import router from "@/router";
import {useTranslationsStore} from "@/stores/translations";
import {useBookmarkStore} from "@/stores/Management/bookmarkStore";
import {useTabAreaStore} from "@/stores/Management/tabAreaStore";

// Store - Translations
const storeTranslations = useTranslationsStore();
const {dataTables} = storeTranslations;

// Store - Bookmark
const storeBookmark = useBookmarkStore();
const {datatableCount, datatableData, isLoading} = storeToRefs(storeBookmark);

// Store - Tab-Area
const storeTabArea = useTabAreaStore();
const {dropdownData: tabAreaDropdown} = storeToRefs(storeTabArea);
storeTabArea.getForDropdown();

// Filter für die Tabelle
const globalFilterFields = ['tA.designation', 'designation', 'comment'];
const tableFilters = {
  'global': {value: null, matchMode: FilterMatchMode.CONTAINS},
  'id': {value: null, matchMode: FilterMatchMode.CONTAINS},
  'tA.designation': {value: null, matchMode: FilterMatchMode.CONTAINS},
  'tA.sorting': {value: null, matchMode: FilterMatchMode.CONTAINS},
  'bC.designation': {value: null, matchMode: FilterMatchMode.CONTAINS},
  'bC.sorting': {value: null, matchMode: FilterMatchMode.CONTAINS},
  'hyperlinkUrl': {value: null, matchMode: FilterMatchMode.CONTAINS},
  'hyperlinkDescription': {value: null, matchMode: FilterMatchMode.CONTAINS},
  'sorting': {value: null, matchMode: FilterMatchMode.STARTS_WITH},
  'comment': {value: null, matchMode: FilterMatchMode.CONTAINS},
  'createdAt': {value: null, matchMode: FilterMatchMode.STARTS_WITH},
  'updatedAt': {value: null, matchMode: FilterMatchMode.STARTS_WITH}
};

// Überschrift
const headerText = ref(dataTables.bookmarks.headline);

// Spalten für die Tabelle
const tableColumnsDefault = ref([
  {
    field: 'id',
    header: dataTables.bookmarks.columns.id,
    showing: true,
    filter: false,
    sortable: false,
    defaultView: false,
    filterTyp: 'text',
    dataType: 'text'
  },
  {
    field: 'tA.designation',
    mainField: 'tabArea',
    hasSubfield: true,
    showFilterMenu: false,
    filterOptions: tabAreaDropdown,
    header: dataTables.bookmarks.columns.tabAreaDesignation,
    showing: true,
    filter: true,
    sortable: true,
    defaultView: true,
    filterTyp: 'multiSelect',
    dataType: 'text'
  },
  {
    field: 'tA.sorting',
    mainField: 'tabArea',
    hasSubfield: true,
    header: dataTables.bookmarks.columns.tabAreaSorting,
    showing: true,
    filter: true,
    sortable: true,
    defaultView: false,
    filterTyp: 'text',
    dataType: 'text'
  },
  {
    field: 'bC.designation',
    mainField: 'bookmarkCategory',
    hasSubfield: true,
    header: dataTables.bookmarks.columns.bookmarkCategoryDesignation,
    showing: true,
    filter: true,
    sortable: true,
    defaultView: true,
    filterTyp: 'text',
    dataType: 'text'
  },
  {
    field: 'tA.sorting',
    mainField: 'bookmarkCategory',
    hasSubfield: true,
    header: dataTables.bookmarks.columns.bookmarkCategorySorting,
    showing: true,
    filter: true,
    sortable: true,
    defaultView: false,
    filterTyp: 'text',
    dataType: 'text'
  },
  {
    field: 'hyperlinkUrl',
    header: dataTables.bookmarks.columns.hyperlinkUrl,
    showing: true,
    filter: true,
    sortable: true,
    defaultView: true,
    filterTyp: 'text',
    dataType: 'text'
  },
  {
    field: 'hyperlinkDescription',
    header: dataTables.bookmarks.columns.hyperlinkDescription,
    showing: true,
    filter: true,
    sortable: true,
    defaultView: true,
    filterTyp: 'text',
    dataType: 'text'
  },
  {
    field: 'sorting',
    header: dataTables.bookmarks.columns.sorting,
    showing: true,
    filter: true,
    sortable: true,
    defaultView: true,
    filterTyp: 'numeric',
    dataType: 'numeric'
  },
  {
    field: 'comment',
    header: dataTables.bookmarks.columns.comment,
    showing: true,
    filter: true,
    sortable: true,
    defaultView: false,
    filterTyp: 'text',
    dataType: 'text'
  },
  {
    field: 'createdAt',
    header: dataTables.bookmarks.columns.createdAt,
    showing: true,
    filter: true,
    sortable: true,
    defaultView: false,
    filterTyp: 'dateTime',
    dataType: 'date'
  },
  {
    field: 'updatedAt',
    header: dataTables.bookmarks.columns.updatedAt,
    showing: true,
    filter: true,
    sortable: true,
    defaultView: false,
    filterTyp: 'dateTime',
    dataType: 'date'
  }
]);

// Spalten für die Sortierung
const multiSortMeta = ref([{field: 'tA.sorting', order: 1}, {field: 'bC.sorting', order: 1}, {field: 'sorting', order: 1}]);

// Abrufen der Daten
const fetch = async (param) => {
  await storeBookmark.getForDatatable(param);
};

// Aktionen beim Klick auf Add, Edit und Delete
const actionOnButton = (type, id = null) => {
  if (type && type === 'new') {
    router.push({name: `${managementAreaNames.bookmarkNew}`})
  } else if (type && id && type === 'edit') {
    router.push({name: `${managementAreaNames.bookmarkEdit}`, params: {'id': id}})
  } else if (type && id && type === 'delete') {
    router.push({name: `${managementAreaNames.bookmarkDelete}`, params: {'id': id}})
  }
};
</script>