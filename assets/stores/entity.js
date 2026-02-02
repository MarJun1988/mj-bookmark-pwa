import {defineStore, storeToRefs} from "pinia";
import {useApiStore} from "@/stores/api";
import {ref} from "vue";
import axios from "axios";
import {useTranslationsStore} from "@/stores/translations";


const apiUrl = useApiStore();

// Store - Übersetzungen
const storeTranslation = useTranslationsStore();
const {components} = storeToRefs(storeTranslation)

// Angemeldeter Nutzer
// const storeLoggedUser = useLoggedUserStore();
// const {currentUser} = storeToRefs(storeLoggedUser)

let nameOfTheStore = `Entity`;
export const useEntityStore = defineStore(`store${nameOfTheStore}`, () => {

        // State
        const result = ref({
            status: null, message: null, errors: [], type: null
        });


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

        /**
         * Action, Create, Update and Delete the Entry
         *
         * @param entity
         * @param param
         * @param actionType
         * @returns {Promise<void>}
         */
        const itemAction = async (entity, param, actionType) => {
            // Löschen der alten Results
            await resetResult();

            let url = '';
            let store = '';

            switch (await entity) {
                // case 'FederalState':
                //     if (actionType === 'edit' || actionType === 'delete') {
                //         url = apiUrl.federalState[actionType].slice(0, -4) + `/${param.id}`;
                //     } else {
                //         url = apiUrl.federalState[actionType]
                //     }
                //     store = useFederalStateStore();
                //     break;
            }

            await axios.post(url, param)
                .then(async response => {
                    if (response && response.data) {
                        // Rückgabewert im Store Speichern
                        result.value = await response.data
                        // Abrufen der Daten aus der Datenbank
                        if (store) {
                            // await store.loadDataForTable(useDataTableStore().lastLazyParams);
                        }
                    }
                })
                .catch(async error => {
                        if (error && error.response && error.response.data) {
                            // Keine Rechte
                            if (parseInt(error.response.data.status) === 403) {
                                result.value = {
                                    status: 403, message: components.value.toastMessage.noRight.message
                                };
                            } else {
                                // Rückgabewert im Store Speichern
                                result.value = await error.response.data;
                                // if (currentUser.value.developer) {
                                //     console.error(error);
                                // }
                            }
                        }
                    }
                )
            ;

        }

        return {result, resetResult, itemAction}
    })
;