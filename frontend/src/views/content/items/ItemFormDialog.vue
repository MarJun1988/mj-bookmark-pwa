<script lang="ts" setup>
import { computed, type ComputedRef, onBeforeMount, ref, watch } from "vue";
import { router } from "@/router";
import { useRoute } from "vue-router";
import { ROUTE } from "@/utils/router.names.ts";
import { useItemStore } from "@/stores/item.store.ts";
import { useTabStore } from "@/stores/tab.store.ts";
import { useGroupStore } from "@/stores/group.store.ts";
import FormGenerator from "@/components/form/FormGenerator.vue";
import { itemFormFields } from "@/utils/forms/item.form.ts";
import type { FormMode } from "@/utils/forms/types.ts";
import type { Item, Tag } from "@/utils/interfaces.ts";
import FormActionButtons from "@/components/form/FormActionButtons.vue";
import { useTagStore } from "@/stores/tag.store.ts";

// allgemeiner Store
const itemStore = useItemStore();

const route = useRoute();

const mode: ComputedRef<FormMode> = computed<FormMode>(() => {
  if (route.name === ROUTE.CONTENT.ITEMS_NEW) return "create";
  if (route.name === ROUTE.CONTENT.ITEMS_EDIT) return "edit";
  if (route.name === ROUTE.CONTENT.ITEMS_DELETE) return "delete";
  return "create";
});

const dialogHeader: ComputedRef<string> = computed<string>(() => {
  let header: string = "Item ";
  if (route.name === ROUTE.CONTENT.ITEMS_NEW) return header + "anlegen";
  if (route.name === ROUTE.CONTENT.ITEMS_EDIT) return header + "bearbeiten";
  if (route.name === ROUTE.CONTENT.ITEMS_DELETE) return header + "löschen";
  return header;
});

async function confirmDelete() {
  await itemStore.deleteItem([route.params.id as string]);
  hideDialog();
}

const defaultItem: Item = {
  id: "",
  type: "LINK",
  order: 0,
  title: "",
  groupId: "",
  group: {
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
    order: 0,
    title: "",
    id: "",
    tabId: "",
    createdAt: null,
    updatedAt: null,
  },
  url: "",
  config: {} as JSON,

  tags: [] as Tag[],
  createdAt: new Date(),
  updatedAt: null,
};

const formModel = ref<Record<string, any>>({ ...defaultItem });

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

const tabStore = useTabStore();
const groupStore = useGroupStore();
const tagStore = useTagStore();

watch(
  () => route.params.id,
  async (id) => {
    // 🔥 sicherstellen, dass Lookup-Daten da sind
    await Promise.all([
      tabStore.fetchAllItemsForSelect(),
      groupStore.fetchAllItems(),
      tagStore.fetchAllItemsForSelect(),
    ]);

    if (id) {
      await itemStore.fetchOnlyItem(id as string);

      if (id) {
        formModel.value = {
          ...itemStore.item,
          __tabId: itemStore.item.group.tabId, // 👈 einzig nötiger Zusatz,
          // von Tag[] → string[]
          tagIds: itemStore.item.tags?.map((t: Tag) => t.id) ?? [],
        };
      }
    } else {
      formModel.value = { ...defaultItem };
    }

    isReady.value = true;
  },
  { immediate: true },
);

// const isFormValid = computed(() => {
//   if (!schema.value?.length) return false
//
//   return schema.value
//       .filter((field: FormField) => field.required)
//       .every((field: FormField) => {
//         const value = getValueByPath(formModel.value, field.name)
//         console.log('value', value , field.name)
//
//         // leere Werte abfangen
//         if (value === null || value === undefined) return false
//         if (typeof value === 'string' && value.trim() === '') return false
//         if (Array.isArray(value) && value.length === 0) return false
//
//         return true
//       })
// })

async function onSubmit() {
  // von string[] → Tag[]
  // formModel.value.tags = tagStore.allItemsForSelect.filter(t => formModel.value.tags.includes(t.value))

  if (mode.value === "create") {
    if (await itemStore.createItem(formModel.value)) {
      autoCloseModal();
    }
  }

  if (mode.value === "edit") {
    if (await itemStore.updateItem(formModel.value)) {
      autoCloseModal();
    }
  }
}

function autoCloseModal() {
  visible.value = !autoClose.value;
}

onBeforeMount(async () => {
  // 🔥 sicherstellen, dass Lookup-Daten da sind
  await Promise.all([tabStore.fetchAllItemsForSelect()]);
  await Promise.all([tagStore.fetchAllItemsForSelect()]);
});

const formRef = ref<InstanceType<typeof FormGenerator> | null>(null);

const isLoading = computed(() => {
  switch (mode.value) {
    case "create":
      return itemStore.creatingLoading;
    case "edit":
      return itemStore.updatingLoading;
    case "delete":
      return itemStore.deletingLoading;
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

    <!-- einzelne Eingabefelder -->
    <FormGenerator
      ref="formRef"
      v-model="formModel"
      :fields="itemFormFields"
      mode="edit"
      :isReady="isReady"
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
