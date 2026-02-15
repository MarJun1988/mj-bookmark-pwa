<script lang="ts" setup>
import { computed, type ComputedRef, type Ref, ref, watch } from "vue";
import { type Tag } from "@/utils/interfaces.ts";
import { router } from "@/router";
import { useRoute } from "vue-router";
import { ROUTE } from "@/utils/router.names.ts";
import { useTagStore } from "@/stores/tag.store.ts";
import { tagFormFields } from "@/utils/forms/tag.form.ts";
import FormGenerator from "@/components/form/FormGenerator.vue";
import type { FormMode } from "@/utils/forms/types.ts";

const tagStore = useTagStore();

const route = useRoute();

const mode: ComputedRef<FormMode> = computed<FormMode>(() => {
  if (route.name === ROUTE.SYSTEM.TAGS_NEW) return "create";
  if (route.name === ROUTE.SYSTEM.TAGS_EDIT) return "edit";
  if (route.name === ROUTE.SYSTEM.TAGS_DELETE) return "delete";
  return "create";
});

const dialogHeader: ComputedRef<string> = computed<string>(() => {
  let header: string = "Tag ";
  if (route.name === ROUTE.SYSTEM.TAGS_NEW) return header + "anlegen";
  if (route.name === ROUTE.SYSTEM.TAGS_EDIT) return header + "bearbeiten";
  if (route.name === ROUTE.SYSTEM.TAGS_DELETE) return header + "löschen";
  return header;
});

async function onSubmit() {
  if (mode.value === "create") {
    if (await tagStore.createItem(initialValues.value)) {
      autoCloseModal();
    }
  }

  if (mode.value === "edit") {
    if (await tagStore.updateItem(initialValues.value)) {
      autoCloseModal();
    }
  }
}

function autoCloseModal() {
  visible.value = !autoClose.value;
}

async function confirmDelete() {
  await tagStore.deleteItem([route.params.id as string]);
  hideDialog();
}

const defaultTag: Tag = {
  id: "",
  name: "",
  slug: "",
  createdAt: new Date(),
  updatedAt: null,
};

const initialValues = ref<Record<string, any>>({ ...defaultTag });

const visible = ref(true);
const isReady = ref(false);

// Dialog schließen
const hideDialog = () => {
  visible.value = false;
};

// Dialog automatisch Schließen
const autoClose = ref(true);

const validateOnMount: Ref<string[]> = ref([]);

// watch works directly on a ref
watch(visible, async (newVisible) => {
  if (!newVisible) {
    router.back();
  }
});

watch(
  () => route.params.id,
  async (id) => {
    if (id) {
      // 🔁 EDIT
      await tagStore.fetchOnlyItem(id as string);

      validateOnMount.value = [];

      // WICHTIG: Kopie, nicht Referenz!
      initialValues.value = {
        ...tagStore.item,
      };
    } else {
      validateOnMount.value = ["name", "slug"];
      initialValues.value = { ...defaultTag };
    }
    isReady.value = true;
  },
  { immediate: true },
);
const formRef = ref<InstanceType<typeof FormGenerator> | null>(null);

const isLoading = computed(() => {
  switch (mode.value) {
    case "create":
      return tagStore.creatingLoading;
    case "edit":
      return tagStore.updatingLoading;
    case "delete":
      return tagStore.deletingLoading;
    default:
      return false;
  }
});
</script>

<template>
  <Dialog
    v-model:visible="visible"
    :block-scroll="true"
    :header="dialogHeader"
    class="sm:w-3/5 md:w-4/5 xl:w-3/5"
    modal
    pt:footer="border-t"
    pt:header="border-b mb-5"
  >
    <!-- Textmeldung -->
    <Message
      v-if="mode === 'delete'"
      class="col-span-4 mb-2"
      icon="pi pi-exclamation-triangle"
      pt:text:class="font-bold !text-2xl w-full text-center"
      severity="error"
      size="large"
    >
      Wollen Sie diesen Eintrag löschen?
    </Message>

    <FormGenerator
      ref="formRef"
      v-model="initialValues"
      :fields="tagFormFields(mode)"
      mode="edit"
      :isReady="isReady"
      @submit="onSubmit"
    />

    <!-- Fußzeile -->
    <template #footer>
      <DialogFooterButton
        :formRef="formRef"
        :mode="mode"
        :isLoading="isLoading"
        :autoClose="autoClose"
        @hide-dialog="hideDialog"
        @auto-close="autoClose = $event"
        @confirm-delete="confirmDelete"
        @on-submit="onSubmit"
      />
    </template>
  </Dialog>
</template>
