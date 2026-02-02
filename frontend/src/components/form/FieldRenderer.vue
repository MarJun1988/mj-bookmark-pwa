<script lang="ts" setup>
import FloatLabel from "primevue/floatlabel";
import InputText from "primevue/inputtext";
import DatePicker from "primevue/datepicker";
import {
  type FormField,
  type FormMode,
  getValueByPath,
  type SelectOption,
  setValueByPath,
} from "@/utils/forms/types.ts";
import { useUiStore } from "@/stores/ui.store.ts";
import { computed } from "vue";
import { apolloClient } from "@/apollo/client.ts";
import { QUERY_ITEM_PREVIEW_LINK_META } from "@/utils/graphql/graphql.item.ts";
import { storeToRefs } from "pinia";
import { useCommonStore } from "@/stores/common.store.ts";
import { useToastStore } from "@/stores/toast.store.ts";
import { devLog } from "@/utils/utils.ts";

const props = defineProps<{
  field: FormField;
  model: Record<string, any>;
  mode: FormMode;
  isReady: boolean;
}>();

const emit = defineEmits<{
  (e: "update", value: unknown): void;
}>();

const visible = computed(() => {
  return props.field.visible ? props.field.visible(props.model) : true;
});

const disabled = computed(() => {
  return props.field.disabled ? props.field.disabled(props.model) : false;
});

const readonly = computed(() => {
  return props.field.readonly ? props.field.readonly(props.model) : false;
});

const required = computed(() => {
  return props.field.required ? props.field.required(props.model) : false;
});

const ui = useUiStore();
// allgemeiner Store
const common = useCommonStore();
const { isLoadingFaviconAndTitle } = storeToRefs(common);

/* ======================
   🔽 OPTIONS AUFLÖSEN
   HIER GEHÖRT computed HIN
====================== */
const resolvedOptions = computed<SelectOption[]>(() => {
  if (!props.field.options) return [];

  return typeof props.field.options === "function"
    ? props.field.options(props.model as any)
    : props.field.options;
});

function resolveValue() {
  const value = getValueByPath(props.model, props.field.name);

  switch (props.field.type) {
    case "multiselect":
      return Array.isArray(value) ? value : [];
    default:
      return value ?? null;
  }
}

/* ========= TEXT ========= */
const textValue = computed<string | null>(() => {
  if (
    props.field.type !== "text" &&
    props.field.type !== "email" &&
    props.field.type !== "url"
  )
    return null;
  const v = getValueByPath(props.model, props.field.name);
  return typeof v === "string" ? v : (v?.toString?.() ?? null);
});

/* ========= NUMBER ========= */
const numberValue = computed<number | null>(() => {
  if (props.field.type !== "number") return null;

  const v = getValueByPath(props.model, props.field.name);

  if (v == null) return null;

  if (typeof v === "number") {
    return Number.isFinite(v) ? v : null;
  }

  if (typeof v === "string") {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }

  return null;
});

/* ========= DATETIME ========= */
const dateValue = computed<Date | null>(() => {
  if (props.field.type !== "datetime") return null;

  const v = getValueByPath(props.model, props.field.name);

  if (v == null) return null;

  if (v instanceof Date) {
    return v;
  }

  if (typeof v === "string" || typeof v === "number") {
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  }

  return null;
});

/* ========= IMAGE ========= */
// const imageValue = computed<string | "">(() => {
//   if (props.field.type !== 'img') return ""
//   const v = getValueByPath(props.model, props.field.name)
//   return typeof v === 'string' ? v: v?.toString?.() ?? ""
// })
/* ========= FAVICON ========= */
const faviconValue = computed<string | "">(() => {
  if (props.field.affects?.favicon) {
    const v = getValueByPath(props.model, props.field.affects?.favicon);
    return typeof v === "string" ? v : (v?.toString?.() ?? "");
  }
  return "";
});

function getHumanErrorMessage(err: unknown): string {
  const graphQLError = (err as any)?.graphQLErrors?.[0];

  const code = graphQLError?.extensions?.code;
  const message = graphQLError?.message;

  switch (code) {
    case "FETCH_TERMINATED":
      return "Die Website hat die Verbindung unerwartet beendet.";
    case "FETCH_TIMEOUT":
      return "Zeitüberschreitung beim Laden der Website.";
    case "SSL_ERROR":
      return "Die Website verwendet ein nicht vertrauenswürdiges SSL-Zertifikat.";
    case "FETCH_FAILED":
      return "Die Website konnte nicht geladen werden.";
    case "UNKNOWN_ERROR":
      return "Beim Laden der Website ist ein unbekannter Fehler aufgetreten.";
    case "LINK_META_FAILED":
      return "Vorschau der Website konnte nicht geladen werden.";
    default:
      return message ?? "Es ist ein unerwarteter Fehler aufgetreten.";
  }
}

async function handleBlur(field: FormField) {
  if (field.onBlurAction !== "previewLinkMeta") return;

  isLoadingFaviconAndTitle.value = true;

  const url = getValueByPath(props.model, field.name);
  const toastStore = useToastStore();

  if (!url) return;

  try {
    const { data } = await apolloClient.query({
      query: QUERY_ITEM_PREVIEW_LINK_META,
      variables: { url },
      fetchPolicy: "no-cache",
    });

    if (!data?.previewLinkMeta) return;

    // 🧠 Titel nur setzen, wenn Ziel-Feld leer ist
    if (
      field.affects?.title &&
      !getValueByPath(props.model, field.affects.title)
    ) {
      setValueByPath(
        props.model,
        field.affects.title,
        data.previewLinkMeta.title,
      );
    }

    // 🖼 Favicon immer setzen
    if (field.affects?.favicon) {
      console.log("data.previewLinkMeta.favicon", data.previewLinkMeta.favicon);
      setValueByPath(
        props.model,
        field.affects.favicon,
        data.previewLinkMeta.favicon,
      );
    }

    toastStore.success({
      summary: "Vorschau geladen",
      detail: "Titel und Favicon wurden erfolgreich abgerufen.",
    });
  } catch (err: any) {
    toastStore.error({
      summary: "Fehler beim Laden der Vorschau",
      detail: getHumanErrorMessage(err),
    });

    devLog("previewLinkMeta failed", err);
  } finally {
    isLoadingFaviconAndTitle.value = false;
  }
}
</script>

<template>
  <div
    v-if="visible"
    :class="field.class ?? 'col-span-12'"
  >
    <FloatLabel
      v-if="props.isReady"
      :variant="ui.floatLabelVariant"
    >
      <!-- TEXT -->
      <InputText
        v-if="field.type === 'text'"
        :id="field.name"
        :disabled="disabled"
        :model-value="textValue"
        :readonly="readonly"
        :required="required"
        :aria-required="required"
        fluid
        @update:model-value="emit('update', $event)"
      />

      <!-- E-MAIL -->
      <InputText
        v-else-if="field.type === 'email'"
        :id="field.name"
        :disabled="disabled"
        :model-value="textValue"
        :readonly="readonly"
        :required="required"
        :aria-required="required"
        fluid
        type="email"
        @update:model-value="emit('update', $event)"
      />

      <!-- URL -->
      <IconField v-else-if="field.type === 'url'">
        <InputIcon class="w-5 h-5">
          <img
            :src="faviconValue"
            alt=""
          >
        </InputIcon>
        <InputText
          :id="field.name"
          :disabled="disabled"
          :model-value="textValue"
          :readonly="readonly"
          :required="required"
          fluid
          :aria-required="required"
          type="url"
          @blur="handleBlur(field)"
          @update:model-value="emit('update', $event)"
        />
        <InputIcon
          v-if="isLoadingFaviconAndTitle"
          class="pi pi-spin pi-spinner"
        />
        <InputIcon
          v-if="!isLoadingFaviconAndTitle"
          v-tooltip="'Vorschau erneut abrufen'"
          class="pi pi-refresh cursor-pointer text-sm opacity-60 hover:opacity-100"
          @click="handleBlur(field)"
        />
      </IconField>

      <!-- FAVICON -->
      <div
        v-else-if="field.type === 'img'"
        class="p-4"
      />

      <!-- NUMBER -->
      <InputNumber
        v-else-if="field.type === 'number'"
        :disabled="disabled"
        :model-value="numberValue"
        :readonly="readonly"
        :required="required"
        fluid
        :inputId="field.name"
        show-buttons
        :aria-required="required"
        @update:model-value="emit('update', $event)"
      />

      <!-- DATETIME -->
      <DatePicker
        v-else-if="field.type === 'datetime'"
        :disabled="disabled"
        :model-value="dateValue"
        :readonly="readonly"
        :required="required"
        fluid
        :inputId="field.name"
        show-icon
        show-time
        :aria-required="required"
        @update:model-value="emit('update', $event)"
      />

      <!-- SELECT -->
      <Select
        v-else-if="field.type === 'select'"
        :disabled="disabled"
        :model-value="resolveValue()"
        :options="resolvedOptions"
        :readonly="readonly"
        :required="required"
        :inputId="field.name"
        :aria-required="required"
        fluid
        optionLabel="label"
        optionValue="value"
        @update:model-value="emit('update', $event)"
      />

      <!-- MULTISELECT -->
      <MultiSelect
        v-else-if="field.type === 'multiselect'"
        :id="field.name"
        :disabled="disabled"
        :model-value="resolveValue()"
        :options="resolvedOptions"
        :readonly="readonly"
        :aria-required="required"
        :required="required"
        fluid
        optionLabel="label"
        optionValue="value"
        @update:model-value="emit('update', $event)"
      />

      <!-- PASSWORD -->
      <Password
        v-else-if="field.type === 'password'"
        :disabled="disabled"
        :inputId="field.name"
        :model-value="textValue"
        :readonly="readonly"
        :required="required"
        :aria-required="required"
        :feedback="field.componentProps?.feedback"
        fluid
        toggleMask
        @update:model-value="emit('update', $event)"
      />
      <label
        :for="field.name"
        class="flex items-center gap-1"
      >
        <span
          v-if="required"
          v-tooltip="'Pflichtfeld'"
          aria-hidden="true"
          class="text-red-500"
        >
          *
        </span>

        <span>{{ field.label }}</span>
      </label>
    </FloatLabel>

    <Skeleton
      v-else
      class="min-h-14.25"
    />
  </div>
</template>
