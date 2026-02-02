import {ref} from 'vue'
import {defineStore} from 'pinia'
import {
  addedEntryByApi,
  deletedEntryByApi,
  getDropdownFromApi,
  getEntryByIdFromApi,
  getLastSortingFromApi,
  getTabledataFromApi,
  updatedEntryByApi
} from "@/utils";

export const useBookmarkCategoryStore = defineStore('bookmarkCategory', () => {
  // State
  // For Datatable
  const datatableData = ref([]);
  const datatableCount = ref(0);
  const datatableFilterCount = ref(0);
  // For Dropdown
  const dropdownData = ref([]);
  // Loading Staten
  const isLoading = ref(true);
  // Entry
  const actionSuccess = ref(false);
  const dialogAutoClose = ref(true);
  const defaultEntry = ref({
    id: null,
    tabArea: {
      id: null
    },
    designation: "",
    sorting: 0,
    comment: ""
  });
  const emptyDefaultEntry = { ...defaultEntry.value }

  // Actions
  /**
   * Read the Data for the Datatable
   *
   * @param lazyParams
   * @returns {Promise<void>}
   */
  const getForDatatable = async (lazyParams = null) => {
    // Status - Laden setzen
    isLoading.value = true;

    // Abrufen der Daten
    const result = await getTabledataFromApi(
        'bookmarkCategory',
        lazyParams);
    datatableData.value = result.resDatatableData
    datatableCount.value = result.resDatatableCount
    datatableFilterCount.value = result.resDatatableFilterCount

    // Status - Laden entfernen
    isLoading.value = false;
  };
  /**
   * Read the Data for Dropdown
   *
   * @param id
   * @returns {Promise<void>}
   */
  const getForDropdown = async (id = null) => {
    // Status - Laden setzen
    isLoading.value = true;

    const result = await getDropdownFromApi(
        'bookmarkCategory', id);
    dropdownData.value = result.resDropdownData;

    // Status - Laden entfernen
    isLoading.value = false;
  };
  /**
   * Read One Entry with ID From the Database
   *
   * @param id
   * @returns {Promise<void>}
   */
  const getEntryById = async (id) => {
    // Status - Laden setzen
    isLoading.value = true;

    defaultEntry.value = await getEntryByIdFromApi(
        'bookmarkCategory', id
    );

    // Status - Laden entfernen
    isLoading.value = false;
  };
  /**
   * Read One Entry with ID From the Database
   * to GET the Last Sorting Value
   *
   * @param id
   * @returns {Promise<void>}
   */
  const getLastSorting = async (id = null) => {
    // Status - Laden setzen
    isLoading.value = true;

    let item = await getLastSortingFromApi(
        'bookmarkCategory', id
    );
    if (item) {
      defaultEntry.value.sorting = item.sorting;

    }

    // Status - Laden entfernen
    isLoading.value = false;
  };
  /**
   * Added the Entry in the Database with Api
   * @returns {Promise<void>}
   */
  const addedNewEntry = async (param = null) => {
    // Status - Laden setzen
    isLoading.value = true;
    actionSuccess.value = false;

    const result = await addedEntryByApi(
        'bookmarkCategory', defaultEntry.value
    );
    // Prüfen, ob Erfolgreich
    if (result) {
      // Beim Schließen des Dialoges, Eintragungen löschen
      if (dialogAutoClose.value) {
        defaultEntry.value = { ...emptyDefaultEntry }
      }
      actionSuccess.value = true;
    }
    // Status - Laden entfernen
    isLoading.value = false;
  };
  /**
   * Updated the Entry in the Database with Api
   * @returns {Promise<void>}
   */
  const updatedEntry = async (param = null) => {
    // Status - Laden setzen
    isLoading.value = true;

    const result = await updatedEntryByApi(
        'bookmarkCategory', defaultEntry.value
    );
    // Prüfen, ob Erfolgreich
    if (result) {
      // Beim Schließen des Dialoges, Eintragungen löschen
      if (dialogAutoClose.value) {
        defaultEntry.value = { ...emptyDefaultEntry }
      }
      actionSuccess.value = true;
    }

    // Status - Laden entfernen
    isLoading.value = false;
  };
  /**
   * Deleted the Entry in the Database with Api
   * @returns {Promise<void>}
   */
  const deletedEntry = async (param = null) => {
    // Status - Laden setzen
    isLoading.value = true;

    const result = await deletedEntryByApi(
        'bookmarkCategory', defaultEntry.value
    );
    // Prüfen, ob Erfolgreich
    if (result) {
      actionSuccess.value = true;
      defaultEntry.value = { ...emptyDefaultEntry }
    }

    // Status - Laden entfernen
    isLoading.value = false;
  };

  return {
    datatableData, datatableCount, datatableFilterCount, defaultEntry, dropdownData, isLoading, actionSuccess, dialogAutoClose,
    getForDatatable, getForDropdown, getEntryById, getLastSorting, addedNewEntry, updatedEntry, deletedEntry
  }
})