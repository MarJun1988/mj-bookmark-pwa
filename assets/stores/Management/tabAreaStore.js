import {ref} from 'vue'
import {defineStore} from 'pinia'
import {
    addedEntryByApi,
    deletedEntryByApi,
    getDashboardFromApi,
    getDropdownFromApi,
    getEntryByIdFromApi,
    getLastSortingFromApi,
    getTabledataFromApi,
    updatedEntryByApi
} from "@/utils";

export const useTabAreaStore = defineStore('tabArea', () => {
    // State
    // For Datatable
    const datatableData = ref([]);
    const datatableCount = ref(0);
    const datatableFilterCount = ref(0);
    // For Dropdown
    const dropdownData = ref([]);
    // For Dashboard
    const dashboardData = ref([]);
    const dashboardDataSort = ref([]);
    // Loading Staten
    const isLoading = ref(true);
    // Entry
    const actionSuccess = ref(false);
    const dialogAutoClose = ref(true);
    const defaultEntry = ref({
        id: null,
        designation: "",
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
            'tabArea',
            lazyParams);
        datatableData.value = result.resDatatableData
        datatableCount.value = result.resDatatableCount
        datatableFilterCount.value = result.resDatatableFilterCount

        // Status - Laden entfernen
        isLoading.value = false;
    };
    /**
     * Read the Data for the Dashboard
     * @param lazyParams
     * @returns {Promise<void>}
     */
    const getForDashboard = async (param = null) => {
        // Status - Laden setzen
        isLoading.value = true;

        // Abrufen der Daten
        const result = await getDashboardFromApi(
            'tabArea');
        dashboardData.value = result.resDashboardData

        // Sortierung der Lesezeichen Kategorien sowie der Lesezeichen
        dashboardData.value.forEach((tabArea, index) => {
            if (tabArea && tabArea.bookmarkCategories) {
                tabArea.bookmarkCategories.forEach((bookmarkCategory, index) => {
                    bookmarkCategory.bookmarks.sort(
                        function (a, b) {
                            if (a.sorting < b.sorting) {
                                return -1;
                            }
                            if (a.sorting > b.sorting) {
                                return 1;
                            }
                            return 0
                        });
                    // console.log(sortBookmarks);

                })

                tabArea.bookmarkCategories.sort(
                    function (a, b) {
                        if (a.sorting < b.sorting) {
                            return -1;
                        }
                        if (a.sorting > b.sorting) {
                            return 1;
                        }
                        return 0
                    });
            }
        });

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
            'tabArea');
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
            'tabArea', id
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
            'tabArea', "ohne-id"
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
            'tabArea', defaultEntry.value
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
            'tabArea', defaultEntry.value
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
            'tabArea', defaultEntry.value
        );
        // Prüfen, ob Erfolgreich
        if (result) {
            actionSuccess.value = true;
            defaultEntry.value = {...emptyDefaultEntry}
        }
        // Status - Laden entfernen
        isLoading.value = false;
    };

    return {
        datatableData,
        datatableCount,
        datatableFilterCount,
        defaultEntry,
        dropdownData,
        dashboardData,
        dashboardDataSort,
        isLoading,
        actionSuccess,
        dialogAutoClose,
        getForDatatable,
        getForDashboard,
        getForDropdown,
        getEntryById,
        getLastSorting,
        addedNewEntry,
        updatedEntry,
        deletedEntry
    }
});