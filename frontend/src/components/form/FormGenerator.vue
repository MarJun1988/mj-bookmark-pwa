<script lang="ts" setup>
import {
  type FormField,
  type FormMode,
  getValueByPath,
  setValueByPath,
} from "@/utils/forms/types.ts";
import FieldRenderer from "@/components/form/FieldRenderer.vue";
import { computed, ref, toRaw, watch } from "vue";

const props = defineProps<{
  modelValue: Record<string, any>;
  fields: FormField[];
  mode: FormMode;
  isReady: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: Record<string, unknown>): void;
  (e: "submit"): void;
}>();

/* ======================
   Update Helper
====================== */
function updateField(name: string, value: unknown) {
  const raw = toRaw(props.modelValue);
  const next = structuredClone(raw);
  setValueByPath(next, name, value);
  emit("update:modelValue", next);
}

/* ======================
   User Change Tracking
====================== */
const userChanged = ref<Set<string>>(new Set());

function onFieldUpdate(name: string, value: unknown) {
  userChanged.value.add(name);
  updateField(name, value);
}

/* ======================
   Initialization Guard
====================== */
const isInitializing = ref(true);

watch(
  () => props.modelValue,
  () => {
    isInitializing.value = false;
  },
  { once: true },
);

/* ======================
   Dependency Reset (FINAL)
====================== */
watch(
  () => props.modelValue,
  (newModel, oldModel) => {
    if (isInitializing.value) return;

    props.fields.forEach((field) => {
      if (!field.dependsOn?.length || !field.resetOnDependencyChange) return;

      const depChangedByUser = field.dependsOn.some(
        (dep) =>
          newModel[dep] !== oldModel?.[dep] && userChanged.value.has(dep),
      );

      if (depChangedByUser) {
        updateField(field.name, null);
      }
    });
  },
  { deep: true },
);

const isFormValid = computed(() => {
  return props.fields.every((field) => {
    // nicht sichtbar → egal
    if (field.visible && !field.visible(props.modelValue)) return true;

    // nicht required → egal
    const isRequired =
      typeof field.required === "function"
        ? field.required(props.modelValue)
        : field.required;

    if (!isRequired) return true;

    const value: unknown = getValueByPath(props.modelValue, field.name);

    // Empty-Checks
    if (Array.isArray(value)) {
      return value.length > 0;
    }

    if (typeof value === "string") {
      return value.trim().length > 0;
    }

    if (typeof value === "number") {
      return true; // 0 ist gültig
    }

    return value !== null && value !== undefined;
  });
});

defineExpose({ isFormValid });
</script>

<template>
  <form
    class="grid grid-cols-12 gap-4"
    @submit.prevent="emit('submit')"
  >
    <p class="col-span-12 text-sm text-muted">
      <span class="text-red-500">*</span> Pflichtfelder
    </p>
    <FieldRenderer
      v-for="field in fields"
      :key="field.name"
      :isReady="props.isReady"
      :field="field"
      :mode="mode"
      :model="modelValue"
      @update="onFieldUpdate(field.name, $event)"
    />

    <button
      :aria-disabled="!isFormValid"
      :disabled="!isFormValid"
      type="submit"
      class="hidden"
    />
  </form>
</template>
