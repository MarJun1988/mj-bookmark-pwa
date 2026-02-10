<script lang="ts" setup>
import { watch, ref } from 'vue';
import type { FormMode } from '@/utils/forms/types';
import FormGenerator from "@/components/form/FormGenerator.vue";


const props = defineProps<{
    autoClose: boolean
    isLoading: boolean
    mode: FormMode
    formRef: InstanceType<typeof FormGenerator> | null
}>()

/* ======================
   Emits
====================== */
const emits = defineEmits<{
    hideDialog: []
    autoClose: [event: boolean];
    confirmDelete: [];
    onSubmit: [];
}>()

const localAutoClose = ref(true)

watch(() => props.autoClose, (newValue) => {
    localAutoClose.value = newValue;
})
</script>

<template>
  <div class="flex flex-wrap gap-4 mt-4 w-full justify-between">
    <!-- Schließen Knopf -->
    <Button
      class="order-1"
      icon="pi pi-times"
      label="schließen"
      size="small"
      text
      @click="emits('hideDialog')"
    />

    <!-- Dialog, Automatisch schließen -->
    <div class="hidden md:block w-80 order-2">
      <ToggleButton
        v-model="localAutoClose"
        class="min-w-80"
        off-icon="pi pi-check"
        off-label="Dialog bleibt offen nach aktion."
        on-icon="pi pi-times"
        on-label="Dialog, wird automatisch geschlossen."
        severity="success"
        size="small"
        @change="emits('autoClose', localAutoClose)"
      />
    </div>

    <!-- Erstellen / Speichern Knopf -->
    <FormActionButtons
      :disabled="!props.formRef?.isFormValid"
      :loading="props.isLoading"
      :mode="props.mode"
      @delete="emits('confirmDelete')"
      @submit="emits('onSubmit')"
    />
  </div>
</template>