import axios from "axios";
import {useApiStore} from "@/stores/api";
import {storeToRefs} from "pinia";
// Store with all API Routes
const apiStore = useApiStore();
const {result: apiResult} = storeToRefs(apiStore);

/**
 * Generate the OrderBy Objekt for the Symfony API
 * @param param
 * @returns {*[]}
 */
const generateOrderBy = (param) => {
    let order = [];

    param.forEach(sort => {
        order.push(`${sort.field};${sort.order === 1 ? 'ASC' : 'DESC'}`);
    })

    return order;
};
/**
 * Fetch the Data from the API with Axios
 *
 * @param entityType
 * @param lazyParams
 * @param param
 * @returns {Promise<{resDatatableCount: number, resDatatableData: [], resDatatableFilterCount: number}>}
 */
const getTabledataFromApi = async (entityType, lazyParams = null, param = null) => {
    let para = {};
    let result = {
        resDatatableData: [],
        resDatatableCount: 0,
        resDatatableFilterCount: 0
    };

    if (lazyParams) {
        para = {
            limit: lazyParams.rows, offset: lazyParams.first, order: [], filter: []
        };

        if (lazyParams.multiSortMeta) {
            para.order = generateOrderBy(lazyParams.multiSortMeta);
        }

        // Für die Filterfunktion
        for (const [key, value] of Object.entries(lazyParams.filters)) {
            // Multiselect als Filter
            if (Array.isArray(value.value)) {
                for (const valueKey of value.value) {
                    // Wichtig ist das man auch false nimmt, für die Abfrage von Boolean Werten
                    if (value.value || value.value === false) {
                        para.filter.push({
                            column: key, text: valueKey, matchMode: value.matchMode,
                        });
                    }
                }
            } else {
                // Wichtig ist das man auch false nimmt, für die Abfrage von Boolean Werten
                if (value.value || value.value === false) {
                    para.filter.push({
                        column: key, text: value.value, matchMode: value.matchMode,
                    });
                }
            }
        }
    }

    // Abrufen der Daten per API Schnittstelle
    await axios.get(`${apiStore[entityType].getForDatatable}?${JSON.stringify(para)}`)
        .then(async (response) => {
            if (response && response.data) {
                result.resDatatableData = await response.data.items ?? [];
                result.resDatatableCount = await response.data.totalCount ?? 0;
                result.resDatatableFilterCount = await response.data.filterCount ?? 0;
                // Speichern im Lokalen Browser Store
                localStorage.setItem(`Datatable-${entityType}`, JSON.stringify(result));
            }
        })
        .catch(async (error) => {
            console.error(error);
            // Rückgabe des Wertes aus dem Lokalen Browser Store
            if (localStorage.getItem(`${entityType}`)) {
                result = JSON.parse(localStorage.getItem(`Datatable-${entityType}`));
            }
        })

    return result;
}
/**
 * Fetch the Data from the API with Axios
 *
 * @param entityType
 * @param param
 * @return {Promise<{resDatatableCount: number, resDatatableData: [], resDatatableFilterCount: number}>}
 */
const getDashboardFromApi = async (entityType, param = null) => {
    let result = {
        resDashboardData: []
    };
    // Abrufen der Daten per API Schnittstelle
    await axios.get(apiStore[entityType].getForDashboard)
        .then(async (response) => {
            if (response && response.data) {
                result.resDashboardData = await response.data.items ?? [];
                // Speichern im Lokalen Browser Store
                localStorage.setItem(`Dashboard-${entityType}`, JSON.stringify(result));
            }
        })
        .catch(async (error) => {
            // Rückgabe des Wertes aus dem Lokalen Browser Store
            if (localStorage.getItem(`${entityType}`)) {
                result = JSON.parse(localStorage.getItem(`Dashboard-${entityType}`));
            }
            console.error(error);
        })

    return result;
}
/**
 * Fetch the Data from the API with Axios
 * @param entityType
 * @param id
 * @param param
 * @returns {Promise<{resDropdownData: []}>}
 */
const getDropdownFromApi = async (entityType, id = null, param = null) => {
    let result = {
        resDropdownData: [],
    };

    // Abrufen der Daten per API Schnittstelle
    await axios.get(`${apiStore[entityType].getForDropdown.slice(0, -4)}${id !== null ? '/' + id : ""}`)
        .then(async (response) => {
            if (response && response.data) {
                result.resDropdownData = await response.data.items ?? [];
                // Speichern im Lokalen Browser Store
                localStorage.setItem(`Dropdown-${entityType}`, JSON.stringify(result));
            }
        })
        .catch(async (error) => {
            // Rückgabe des Wertes aus dem Lokalen Browser Store
            if (localStorage.getItem(`${entityType}`)) {
                result = JSON.parse(localStorage.getItem(`Dropdown-${entityType}`));
            }
            console.error(error);
        })

    return result;
}
/**
 * Fetch one Entry from the API with Axios
 * @param entityType
 * @param id
 * @param param
 * @return {Promise<{}>}
 */
const getEntryByIdFromApi = async (entityType, id = null, param = null) => {
    let result = {};

    // Abrufen der Daten per API Schnittstelle
    await axios.get(`${apiStore[entityType].getById.slice(0, -4)}/${id}`)
        .then(async (response) => {
            if (response && response.data && response.data.item) {
                result = await response.data.item ?? {};
            }
        })
        .catch(async (error) => {
            console.error(error);
        })

    return result;
}
/**
 * Fetch one Entry from the API with Axios, to GET last Sorting Value
 * @param entityType
 * @param id
 * @param param
 * @return {Promise<{}|null>}
 */
const getLastSortingFromApi = async (entityType, id = null, param = null) => {
    let result = null;

    // Abrufen der Daten per API Schnittstelle
    await axios.get(`${apiStore[entityType].getLastSorting.slice(0, -4)}${id !== null ? '/' + id : ""}`)
        .then(async (response) => {
            if (response && response.data && response.data.item) {
                result = await response.data.item ?? null;
            }
        })
        .catch(async (error) => {
            console.error(error);
        })

    return result;
}
/**
 * Added new Entry with the API
 * @param entityType
 * @param param
 * @returns {Promise<{}>}
 */
const addedEntryByApi = async (entityType, param) => {
    let result = null;
    // Reset the Data im Store
    await apiStore.resetResult();
    // Entfernen der Fehler
    await removeErrorsOnInputs();

    // Abrufen der Daten per API Schnittstelle
    await axios.post(`${apiStore[entityType].new}`, param)
        .then(async (response) => {
            if (response && response.data && response.data.item) {
                apiResult.value.status = await response.data.status;
                apiResult.value.message = await response.data.message;
                apiResult.value.errors = await response.data.errors;
                apiResult.value.type = "added"
                result = await response.data.item ?? {};
            }
        })
        .catch(async (error) => {
            apiResult.value.status = await error.response.data.status;
            apiResult.value.message = await error.response.data.message;
            apiResult.value.errors = await error.response.data.errors;
            apiResult.value.type = "deleted"
            apiResult.value = await error.response.data;
            console.error(error);
        })

    return result;
}
/**
 * Updated existent Entry with the API
 * @param entityType
 * @param param
 * @returns {Promise<{}>}
 */
const updatedEntryByApi = async (entityType, param) => {
    let result = null;
    // Reset the Data im Store
    await apiStore.resetResult();
    // Entfernen der Fehler
    await removeErrorsOnInputs();

    // Abrufen der Daten per API Schnittstelle
    await axios.put(`${apiStore[entityType].edit.slice(0, -4)}/${param.id}`, param)
        .then(async (response) => {
            if (response && response.data && response.data.item) {
                apiResult.value.status = await response.data.status;
                apiResult.value.message = await response.data.message;
                apiResult.value.errors = await response.data.errors;
                apiResult.value.type = "updated"
                result = await response.data.item ?? {};
            }
        })
        .catch(async (error) => {
            apiResult.value.status = await error.response.data.status;
            apiResult.value.message = await error.response.data.message;
            apiResult.value.errors = await error.response.data.errors;
            apiResult.value.type = "deleted"
            apiResult.value = await error.response.data;
            console.error(error);
        })

    return result;
}
/**
 * Deleted existent Entry with the API
 * @param entityType
 * @param param
 * @returns {Promise<{}>}
 */
const deletedEntryByApi = async (entityType, param) => {
    let result = null;
    // Reset the Data im Store
    await apiStore.resetResult();

    // Abrufen der Daten per API Schnittstelle
    await axios.delete(`${apiStore[entityType].delete.slice(0, -4)}/${param.id}`, param)
        .then(async (response) => {
            if (response && response.data && response.data.item) {
                apiResult.value.status = await response.data.status;
                apiResult.value.message = await response.data.message;
                apiResult.value.errors = await response.data.errors;
                apiResult.value.type = "deleted"
                result = await response.data.item ?? {};
            }
        })
        .catch(async (error) => {
            if (error && error.response && error.response.status && parseInt(error.response.status) === 409) {
                apiResult.value.status = await error.response.data.status;
                apiResult.value.message = await error.response.data.message;
                apiResult.value.errors = await error.response.data.errors;
                apiResult.value.type = "relationsFound"
                apiResult.value = await error.response.data;
                console.error(error);
            } else {
                apiResult.value.status = await error.response.data.status;
                apiResult.value.message = await error.response.data.message;
                apiResult.value.errors = await error.response.data.errors;
                apiResult.value.type = "deleted"
                apiResult.value = await error.response.data;
                console.error(error);
            }
        })


    return result;
}

/**
 * Remove the Error Class on the Input Fields
 * @return {Promise<void>}
 */
const removeErrorsOnInputs = async () => {
    await document.querySelectorAll(".p-invalid").forEach(el => el.classList.remove('p-invalid'));
};

export {
    generateOrderBy,
    getDropdownFromApi, getTabledataFromApi, getDashboardFromApi, getEntryByIdFromApi, getLastSortingFromApi,
    addedEntryByApi, updatedEntryByApi, deletedEntryByApi, removeErrorsOnInputs
}