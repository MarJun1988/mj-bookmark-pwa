import {defineStore} from "pinia";
import {ref} from "vue";

let nameOfTheStore = `DataTable`;
export const useDataTableStore = defineStore(`store${nameOfTheStore}`, () => {
    // State
    const lastLazyParams = ref({
        first: 0,
        rows: 25,
        sortField: null,
        sortOrder: null,
        filters: [],
        multiSortMeta: [],
    });
    // Getters
    // Actions
    return {lastLazyParams}
})