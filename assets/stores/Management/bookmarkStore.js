import {ref} from 'vue'
import {defineStore, storeToRefs} from 'pinia'
import {addedEntryByApi, deletedEntryByApi, getDropdownFromApi, getEntryByIdFromApi, getLastSortingFromApi, getTabledataFromApi, updatedEntryByApi} from "@/utils";
import axios from "axios";
import {useApiStore} from "@/stores/api";

// Store with all API Routes
const apiStore = useApiStore();
const {bookmark} = storeToRefs(apiStore);

export const useBookmarkStore = defineStore('bookmark', () => {
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
        bookmarkCategory: {
            id: null
        },
        hyperlinkUrl: "",
        hyperlinkDescription: "",
        sorting: 0,
        comment: ""
    });
    const emptyDefaultEntry = {...defaultEntry.value}

    // Actions
    /**
     * Read the Data for the Datatable
     * @param lazyParams
     * @returns {Promise<void>}
     */
    const getForDatatable = async (lazyParams = null) => {
        // Status - Laden setzen
        isLoading.value = true;

        // Abrufen der Daten
        const result = await getTabledataFromApi(
            'bookmark',
            lazyParams);
        datatableData.value = result.resDatatableData
        datatableCount.value = result.resDatatableCount
        datatableFilterCount.value = result.resDatatableFilterCount

        // Status - Laden entfernen
        isLoading.value = false;
    };
    /**
     * Read the Data for Dropdown
     * @returns {Promise<void>}
     */
    const getForDropdown = async () => {
        // Status - Laden setzen
        isLoading.value = true;

        const result = await getDropdownFromApi(
            'bookmark');
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
            'bookmark', id
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
            'bookmark', id
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
            'bookmark', defaultEntry.value
        );
        // Prüfen, ob Erfolgreich
        if (result) {
            // Beim Schließen des Dialoges, Eintragungen löschen
            if (dialogAutoClose.value) {
                defaultEntry.value = {...emptyDefaultEntry}
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
            'bookmark', defaultEntry.value
        );
        // Prüfen, ob Erfolgreich
        if (result) {
            // Beim Schließen des Dialoges, Eintragungen löschen
            if (dialogAutoClose.value) {
                defaultEntry.value = {...emptyDefaultEntry}
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
            'bookmark', defaultEntry.value
        );
        // Prüfen, ob Erfolgreich
        if (result) {
            actionSuccess.value = true;
            defaultEntry.value = {...emptyDefaultEntry}
        }

        // Status - Laden entfernen
        isLoading.value = false;
    };

    const getSiteTitle = async (url) => {
        try {
            await axios.post(bookmark.value.getSiteTitle, {url: defaultEntry.value.hyperlinkUrl})
                .then(response => {
                    defaultEntry.value.hyperlinkDescription = response.data;
                });
        } catch (error) {
            console.error('Fehler beim Abrufen der Webseite:', error);
            defaultEntry.value.hyperlinkDescription = 'Kein Titel gefunden!';
        }

    }

    return {
        datatableData, datatableCount, datatableFilterCount, defaultEntry, dropdownData, isLoading, actionSuccess, dialogAutoClose,
        getForDatatable, getForDropdown, getEntryById, getLastSorting, addedNewEntry, updatedEntry, deletedEntry, getSiteTitle
    }
})
