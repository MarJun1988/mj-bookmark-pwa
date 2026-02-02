import {ref} from 'vue'
import {defineStore} from 'pinia'

export const useTranslationsStore = defineStore('translations', () => {
    // State
    const components = ref(__COMPONENTS__);
    const dataTables = ref(__DATA_TABLES__);
    const dialogs = ref(__DIALOGS__);
    const confirmDialog = ref(__CONFIRM_DIALOG__);
    const generals = ref(__GENERALS__);
    const menus = ref(__MENUS__);
    // const sites = ref(__SITES__);

    return {
        components,
        confirmDialog,
        dataTables,
        dialogs,
        generals,
        menus
    }
})
