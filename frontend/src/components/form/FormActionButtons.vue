<script lang="ts" setup>
import type { FormMode } from "@/utils/forms/types";

const props = defineProps<{
  mode: FormMode;
  disabled?: boolean;
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: "submit"): void;
  (e: "delete"): void;
}>();
</script>

<template>
  <!-- NEW -->
  <Button
    v-if="props.mode === 'create'"
    :disabled="disabled"
    :loading="loading"
    class="order-3"
    icon="pi pi-check"
    label="Anlegen"
    @click="emit('submit')"
  />

  <!-- EDIT -->
  <Button
    v-else-if="props.mode === 'edit'"
    :disabled="disabled"
    :loading="loading"
    class="order-3"
    icon="pi pi-save"
    label="Speichern"
    @click="emit('submit')"
  />

  <!-- DELETE -->
  <Button
    v-else-if="props.mode === 'delete'"
    :disabled="disabled"
    :loading="loading"
    class="order-3"
    icon="pi pi-trash"
    label="Löschen"
    severity="danger"
    @click="emit('delete')"
  />
</template>
