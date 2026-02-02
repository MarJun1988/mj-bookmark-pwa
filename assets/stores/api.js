import {defineStore} from "pinia";
import {ref} from "vue";

export const useApiStore = defineStore('api', () => {
    // State
    // API Result
    const result = ref({
        status: null, message: null, errors: [], type: null
    });

    // Abschnitte - Tab Areas
    const tabArea = ref(__API__.tabArea);
    // Lesezeichen Kategorien
    const bookmarkCategory = ref(__API__.bookmarkCategory);
    // Lesezeichen
    const bookmark = ref(__API__.bookmark);

    // Actions
    /**
     * Reset the state result of Default
     *
     * @returns {Promise<void>}
     */
    const resetResult = async () => {
        result.value = {
            status: null, message: null, errors: [], type: null
        }
    }

    return {
        result, tabArea, bookmarkCategory, bookmark,
        resetResult
    }
});