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
import {useBookmarkCategoryStore} from "@/stores/Management/bookmarkCategoryStore";
import {useTabAreaStore} from "@/stores/Management/tabAreaStore";

// Store - Translations
const storeTranslations = useTranslationsStore();
const {dataTables} = storeTranslations;

// Store - Bookmark Category
const storeBookmarkCategory = useBookmarkCategoryStore();
const {datatableCount, datatableData, isLoading} = storeToRefs(storeBookmarkCategory);

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
  'designation': {value: null, matchMode: FilterMatchMode.CONTAINS},
  'sorting': {value: null, matchMode: FilterMatchMode.STARTS_WITH},
  'comment': {value: null, matchMode: FilterMatchMode.CONTAINS},
  'bookmarkCategories': {value: null, matchMode: FilterMatchMode.STARTS_WITH},
  'bookmarks': {value: null, matchMode: FilterMatchMode.STARTS_WITH},
  'createdAt': {value: null, matchMode: FilterMatchMode.STARTS_WITH},
  'updatedAt': {value: null, matchMode: FilterMatchMode.STARTS_WITH}
};

// Überschrift
const headerText = ref(dataTables.bookmarkCategories.headline);

// Spalten für die Tabelle
const tableColumnsDefault = ref([
  {
    field: 'id',
    header: dataTables.bookmarkCategories.columns.id,
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
    header: dataTables.bookmarkCategories.columns.tabAreaDesignation,
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
    header: dataTables.bookmarkCategories.columns.tabAreaSorting,
    showing: true,
    filter: true,
    sortable: true,
    defaultView: false,
    filterTyp: 'text',
    dataType: 'text'
  },
  {
    field: 'designation',
    header: dataTables.bookmarkCategories.columns.designation,
    showing: true,
    filter: true,
    sortable: true,
    defaultView: true,
    filterTyp: 'text',
    dataType: 'text'
  },
  {
    field: 'sorting',
    header: dataTables.bookmarkCategories.columns.sorting,
    showing: true,
    filter: true,
    sortable: true,
    defaultView: true,
    filterTyp: 'numeric',
    dataType: 'numeric'
  },
  {
    field: 'comment',
    header: dataTables.bookmarkCategories.columns.comment,
    showing: true,
    filter: true,
    sortable: true,
    defaultView: false,
    filterTyp: 'text',
    dataType: 'text'
  },
  {
    field: 'bookmarks',
    header: dataTables.bookmarkCategories.columns.bookmarks,
    usedFunction: 'showCount',
    showing: true,
    filter: true,
    sortable: false,
    defaultView: true,
    filterTyp: 'text',
    dataType: 'text'
  },
  {
    field: 'createdAt',
    header: dataTables.bookmarkCategories.columns.createdAt,
    showing: true,
    filter: true,
    sortable: true,
    defaultView: false,
    filterTyp: 'dateTime',
    dataType: 'date'
  },
  {
    field: 'updatedAt',
    header: dataTables.bookmarkCategories.columns.updatedAt,
    showing: true,
    filter: true,
    sortable: true,
    defaultView: false,
    filterTyp: 'dateTime',
    dataType: 'date'
  }
]);

// Spalten für die Sortierung
const multiSortMeta = ref([{field: 'tA.sorting', order: 1}, {field: 'sorting', order: 1}]);

// Abrufen der Daten
const fetch = async (param) => {
  await storeBookmarkCategory.getForDatatable(param);
};

// Aktionen beim Klick auf Add, Edit und Delete
const actionOnButton = (type, id = null) => {
  if (type && type === 'new') {
    router.push({name: `${managementAreaNames.bookmarkCategoryNew}`})
  } else if (type && id && type === 'edit') {
    router.push({name: `${managementAreaNames.bookmarkCategoryEdit}`, params: {'id': id}})
  } else if (type && id && type === 'delete') {
    router.push({name: `${managementAreaNames.bookmarkCategoryDelete}`, params: {'id': id}})
  }
};
</script>