<template>
  <Dialog v-model:visible="visible" :breakpoints="{ '960px': '75vw', '641px': '100vw' }" :draggable="true"
          :header="headerTitle" :style="{ width: '50vw' }"
          class="default-modal"
          maximizable modal @hide="emit('closeDialog')">

    <!-- Inhalt -->
    <generate-formular :disabled-all-fields="true" :fields="viewDeleteFields" :item="item" :only-delete-fields="true"
                       :read-only-all-fields="true"/>
    <!-- Fußzeile -->
    <template #footer>
      <div class="flex flex-wrap gap-2 align-items-center justify-content-between">
        <!-- Schließen -->
        <Button :label="components.dialog.buttonClose" autofocus
                icon="pi pi-times" text @click="emit('closeDialog')"/>
        <!-- Löschen -->
        <Button :label="components.dialog.buttonDelete"
                icon="pi pi-save" severity="danger" @click="emit('itemDelete')"/>
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import {ref} from "vue";
import {useTranslationsStore} from "@/stores/translations";
import GenerateFormular from "@/components/GenerateFormular.vue";

// Variable die auf mit von der Component erwartet werden
const props = defineProps({
  // Überschrift
  headerTitle: {
    type: String,
    required: true,
  },
  // Eintrag
  item: {
    type: Object,
    required: true
  },
  // Felder für die Ausgabe
  viewDeleteFields: {
    type: Object,
    required: true
  },
});

// Events die abgefeuert werden
const emit = defineEmits(['closeDialog', 'itemDelete']);

// Store - Translations
const storeTranslations = useTranslationsStore();
const {components} = storeTranslations;

// Aktions Knopf - Aktivieren / Deaktivieren
const actionButtonDisabled = ref(true);

// Anzeige des Dialoges
const visible = ref(true);

</script>

<style>
/* Bei dem Modal Header, den Mauszeiger ändern */
.default-modal > .p-dialog-header {
  cursor: move;
}
</style>