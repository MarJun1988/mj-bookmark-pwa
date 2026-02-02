<template>
  <Dialog v-model:visible="visible" :breakpoints="{ '960px': '75vw', '641px': '100vw' }" :draggable="true"
          :header="headerTitle" :style="{ width: '50vw' }"
          class="default-modal"
          maximizable modal @hide="emit('closeDialog')">

    <!-- Laden Balken -->
    <div v-if="itemIsLoading" class="col-12">
      <ProgressBar class="bg-yellow-900-900" mode="indeterminate" style="height: 6px"></ProgressBar>
    </div>

    <!-- Inhalt -->
    <generate-formular :disabled-all-fields="itemIsLoading" :fields="fields" :item="item"
                       :read-only-all-fields="itemIsLoading"
                       @enabled-action-button="actionButtonDisabled = $event" @change-drop-down-tab-area="emit('changeDropDownTabArea', $event)" @change-drop-down-bookmark-category="emit('changeDropDownBookmarkCategory', $event)" @get-site-title="emit('getSiteTitle', $event)"/>

    <dialog-message/>

    <!-- Fußzeile -->
    <template #footer>
      <div class="flex flex-wrap justify-content-around md:justify-content-between">
        <!-- Schließen -->
        <Button :label="components.dialog.buttonClose" class="flex"
                icon="pi pi-times" text @click="emit('closeDialog')"/>

        <!-- Dialog, Automatisch schließen -->
        <ToggleButton v-model="autoClose" :offLabel="components.dialog.buttonAutoCloseOff"
                      :onLabel="components.dialog.buttonAutoCloseOn" class="hidden xl:flex"
                      offIcon="pi pi-lock" onIcon="pi pi-lock-open"
                      severity="success"
                      @update:modelValue="emit('changeDialogAutoClose', $event)"/>

        <!-- Dialog, Automatisch schließen -->
        <ToggleButton v-model="autoClose" class="sm:flex md:flex xl:hidden" offIcon="pi pi-lock"
                      offLabel=""
                      onIcon="pi pi-lock-open" onLabel=""
                      severity="success"
                      @update:modelValue="emit('changeDialogAutoClose', $event)"/>

        <!-- Erstellen -->
        <Button v-if="showedActionButton.create" :disabled="actionButtonDisabled"
                :label="components.dialog.buttonCreate"
                class="flex" icon="pi pi-save" severity="success" @click="emit('itemAdd')"/>
        <!-- Speichern -->
        <Button v-if="showedActionButton.save" :disabled="actionButtonDisabled" :label="components.dialog.buttonSave"
                class="flex" icon="pi pi-save" severity="success" @click="emit('itemEdit')"/>
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import {onMounted, ref} from "vue";
import DialogMessage from "@/components/DialogMessage.vue";
import GenerateFormular from "@/components/GenerateFormular.vue";
import {useTranslationsStore} from "@/stores/translations";

// Variable die auf mit von der Component erwartet werden
const props = defineProps({
  // Überschrift
  headerTitle: {
    type: String,
    required: true,
  },
  // Felder
  fields: {
    type: Object,
    required: true
  },
  // Eintrag
  item: {
    type: Object,
    required: true
  },
  // Anzeige - erforderliche Felder
  showRequiredText: {
    type: Boolean,
    required: false,
    default: true
  },
  // Anzeige welcher Button benötigt wird
  showedActionButton: {
    type: Object,
    required: false,
    default: {
      create: true,
      save: false,
    }
  },
  // Dialog automatisch Schließen
  dialogAutoClose: {
    type: Boolean,
    required: false,
    default: true
  },
  // Laden Status vom Item
  itemIsLoading: {
    type: Boolean,
    required: false,
    default: false
  },
// Dialog Nutzer
  dialogUser: {
    type: Boolean,
    required: false,
    default: false
  },
});

// Events die abgefeuert werden
const emit = defineEmits(['closeDialog', 'itemAdd', 'itemEdit', 'changeDialogAutoClose', 'changeDropDownTabArea', 'changeDropDownBookmarkCategory', 'getSiteTitle']);

// Store - Translations
const storeTranslations = useTranslationsStore();
const {components} = storeTranslations;

// Aktions Knopf - Aktivieren / Deaktivieren
const actionButtonDisabled = ref(true);

// Anzeige des Dialoges
const visible = ref(true);

// Dialog automatisch Schließen
const autoClose = ref(true);

// Wird beim ausgeführt beim Laden der Komponente
onMounted(async () => {
  autoClose.value = props.dialogAutoClose;
});
</script>

<style>
/* Bei dem Modal Header, den Mauszeiger ändern */
.default-modal > .p-dialog-header {
  cursor: move;
}
</style>