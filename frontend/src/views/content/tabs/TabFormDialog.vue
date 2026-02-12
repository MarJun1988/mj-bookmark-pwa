<script lang="ts" setup>
import { computed, type ComputedRef, ref, watch } from "vue";
import { router } from "@/router";
import { useRoute } from "vue-router";
import { ROUTE } from "@/utils/router.names.ts";
import { useTabStore } from "@/stores/tab.store.ts";
import { type Group, type Tab } from "@/utils/interfaces.ts";
import FormGenerator from "@/components/form/FormGenerator.vue";
import { tabFormFields } from "@/utils/forms/tab.form.ts";
import type { FormMode } from "@/utils/forms/types.ts";

const tabStore = useTabStore();

const route = useRoute();

const mode: ComputedRef<FormMode> = computed<FormMode>(() => {
  if (route.name === ROUTE.CONTENT.TABS_NEW) return "create";
  if (route.name === ROUTE.CONTENT.TABS_EDIT) return "edit";
  if (route.name === ROUTE.CONTENT.TABS_DELETE) return "delete";
  return "create";
});

const dialogHeader: ComputedRef<string> = computed<string>(() => {
  let header: string = "Tab ";
  if (route.name === ROUTE.CONTENT.TABS_NEW) return header + "anlegen";
  if (route.name === ROUTE.CONTENT.TABS_EDIT) return header + "bearbeiten";
  if (route.name === ROUTE.CONTENT.TABS_DELETE) return header + "löschen";
  return header;
});

async function confirmDelete() {
  await tabStore.deleteItem([route.params.id as string]);
  hideDialog();
}

const defaultTab: Tab = {
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
  id: "",
  title: "",
  order: 0,
  userId: "",
  groups: [],
  createdAt: new Date(),
  updatedAt: null,
};

const formModel = ref<Record<string, any>>({ ...defaultTab });

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
    if (id) {
      // 🔁 EDIT
      await tabStore.fetchOnlyItem(id as string);

      // WICHTIG: Kopie, nicht Referenz!
      formModel.value = {
        id: tabStore.item.id,
        title: tabStore.item.title,
        order: tabStore.item.order,
        userId: tabStore.item.userId,
        createdAt: tabStore.item.createdAt,
        updatedAt: tabStore.item.updatedAt,
        groups: tabStore.item.groups,
      };
    } else {
      formModel.value = { ...defaultTab };
    }
    isReady.value = true;
  },
  { immediate: true },
);

async function onSubmit() {
  if (mode.value === "create") {
    if (await tabStore.createItem(formModel.value)) {
      autoCloseModal();
    }
  }

  if (mode.value === "edit") {
    if (await tabStore.updateItem(formModel.value)) {
      autoCloseModal();
    }
  }
}

function autoCloseModal() {
  visible.value = !autoClose.value;
}

const groupCount = computed(() => {
  return formModel.value.groups.length;
});

const itemCount = computed<number>(() => {
  return formModel.value.groups.reduce(
    (sum: number, g: Group) => sum + (g.items?.length ?? 0),
    0,
  );
});

const formRef = ref<InstanceType<typeof FormGenerator> | null>(null);

const isLoading = computed(() => {
  switch (mode.value) {
    case "create":
      return tabStore.creatingLoading;
    case "edit":
      return tabStore.updatingLoading;
    case "delete":
      return tabStore.deletingLoading;
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
      size="small"
    >
      Tab wirklich löschen? <br>
      <p class="text-base">
        Alle Gruppen und deren Inhalte werden vollständig entfernt.<br>
        Diese Aktion kann nicht rückgängig gemacht werden.<br>
      </p>
      <p class="text-sm text-gray-500 mt-3">
        ({{ groupCount }} Gruppen · {{ itemCount }} Einträge)
      </p>
    </Message>

    <!-- einzelne Eingabefelder -->
    <FormGenerator
      ref="formRef"
      v-model="formModel"
      :fields="tabFormFields(mode)"
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
