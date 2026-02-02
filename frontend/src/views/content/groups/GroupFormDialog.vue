<script lang="ts" setup>
import { computed, type ComputedRef, ref, watch } from "vue";
import { router } from "@/router";
import { useRoute } from "vue-router";
import { ROUTE } from "@/utils/router.names.ts";
import { type Group, type Item } from "@/utils/interfaces.ts";
import { useGroupStore } from "@/stores/group.store.ts";
import { useTabStore } from "@/stores/tab.store.ts";
import FormGenerator from "@/components/form/FormGenerator.vue";
import { groupFormFields } from "@/utils/forms/group.form.ts";
import FormActionButtons from "@/components/form/FormActionButtons.vue";
import type { FormMode } from "@/utils/forms/types.ts";

const groupStore = useGroupStore();
const tabStore = useTabStore();

const route = useRoute();

const mode: ComputedRef<FormMode> = computed<FormMode>(() => {
  if (route.name === ROUTE.CONTENT.GROUPS_NEW) return "create";
  if (route.name === ROUTE.CONTENT.GROUPS_EDIT) return "edit";
  if (route.name === ROUTE.CONTENT.GROUPS_DELETE) return "delete";
  return "create";
});

const dialogHeader: ComputedRef<string> = computed<string>(() => {
  let header: string = "Gruppe ";
  if (route.name === ROUTE.CONTENT.GROUPS_NEW) return header + "anlegen";
  if (route.name === ROUTE.CONTENT.GROUPS_EDIT) return header + "bearbeiten";
  if (route.name === ROUTE.CONTENT.GROUPS_DELETE) return header + "löschen";
  return header;
});

async function onSubmit() {
  if (mode.value === "create") {
    if (await groupStore.createItem(formModel.value)) {
      autoCloseModal();
    }
  }

  if (mode.value === "edit") {
    if (await groupStore.updateItem(formModel.value)) {
      autoCloseModal();
    }
  }
}

async function confirmDelete() {
  await groupStore.deleteItem([route.params.id as string]);
  hideDialog();
}

const defaultGroup: Group = {
  id: "",
  title: "",
  order: 0,
  tabId: "",
  tab: {
    id: "",
    title: "",
    order: 0,
    userId: "",
    user: {
      id: "",
      lastName: "",
      firstName: "",
      displayName: "",
      email: "",
      password: "",
      role: "USER",
      createdAt: null,
    },
    createdAt: null,
  },
  items: [] as Item[],
  createdAt: new Date(),
  updatedAt: null,
};

const formModel = ref<Record<string, any>>({ ...defaultGroup });

const visible = ref(true);
const isReady = ref(false);

// Dialog schließen
const hideDialog = () => {
  visible.value = false;
};

// Dialog automatisch Schließen
const autoClose = ref(true);

// watch works directly on a ref
watch(visible, async (newVisible) => {
  if (!newVisible) {
    router.back();
  }
});

watch(
  () => route.params.id,
  async (id) => {
    // 🔥 sicherstellen, dass Lookup-Daten da sind
    await Promise.all([tabStore.fetchAllItemsForSelect()]);
    if (id) {
      // 🔁 EDIT
      await groupStore.fetchOnlyItem(id as string);

      // WICHTIG: Kopie, nicht Referenz!
      formModel.value = {
        ...groupStore.item,
      };
    } else {
      formModel.value = { ...defaultGroup };
    }
    isReady.value = true;
  },
  { immediate: true },
);

function autoCloseModal() {
  visible.value = !autoClose.value;
}

const itemCount = computed(() => {
  return formModel.value.items.length;
});

const formRef = ref<InstanceType<typeof FormGenerator> | null>(null);

const isLoading = computed(() => {
  switch (mode.value) {
    case "create":
      return groupStore.creatingLoading;
    case "edit":
      return groupStore.updatingLoading;
    case "delete":
      return groupStore.deletingLoading;
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
      Gruppe wirklich löschen? <br>
      <p class="text-base">
        Alle Bookmarks, Widgets und Notizen in dieser Gruppe werden ebenfalls
        gelöscht. <br>
        Diese Aktion kann nicht rückgängig gemacht werden! <br>
      </p>
      <p class="text-sm text-gray-500 mt-3">
        ({{ itemCount }} Einträge)
      </p>
    </Message>
    <!-- einzelne Eingabefelder -->
    <FormGenerator
      ref="formRef"
      v-model="formModel"
      :isReady="isReady"
      :fields="groupFormFields"
      mode="edit"
      @submit="onSubmit"
    />
    <!-- Fußzeile -->
    <template #footer>
      <div class="flex flex-wrap gap-4 mt-4 w-full justify-between">
        <!-- Schließen Knopf -->
        <Button
          class="order-1"
          icon="pi pi-times"
          label="schließen"
          size="small"
          text
          @click="hideDialog"
        />

        <!-- Dialog, Automatisch schließen -->
        <div class="hidden lg:block w-100 order-2 md:order-3">
          <ToggleButton
            v-model="autoClose"
            class="min-w-100"
            off-icon="pi pi-check"
            off-label="Dialog bleibt offen nach aktion."
            on-icon="pi pi-times"
            on-label="Dialog, wird automatisch geschlossen."
            severity="success"
            size="small"
          />
        </div>

        <!-- Erstellen / Speichern Knopf -->
        <FormActionButtons
          :disabled="!formRef?.isFormValid"
          :loading="isLoading"
          :mode="mode"
          @delete="confirmDelete"
          @submit="onSubmit"
        />
      </div>
    </template>
  </Dialog>
</template>
