<script lang="ts" setup>
import { computed, type ComputedRef, ref, watch } from "vue";
import { Role, type User } from "@/utils/interfaces.ts";
import { router } from "@/router";
import { useUserStore } from "@/stores/user.store.ts";
import { useRoute } from "vue-router";
import { ROUTE } from "@/utils/router.names.ts";
import FormGenerator from "@/components/form/FormGenerator.vue";
import { userFormFields } from "@/utils/forms/user.form.ts";
import type { FormMode } from "@/utils/forms/types.ts";

const userStore = useUserStore();

const route = useRoute();

const mode: ComputedRef<FormMode> = computed<FormMode>(() => {
  if (route.name === ROUTE.SYSTEM.USERS_NEW) return "create";
  if (route.name === ROUTE.SYSTEM.USERS_EDIT) return "edit";
  if (route.name === ROUTE.SYSTEM.USERS_DELETE) return "delete";
  return "create";
});

const dialogHeader: ComputedRef<string> = computed<string>(() => {
  let header: string = "Nutzer ";
  if (route.name === ROUTE.SYSTEM.USERS_NEW) return header + "anlegen";
  if (route.name === ROUTE.SYSTEM.USERS_EDIT) return header + "bearbeiten";
  if (route.name === ROUTE.SYSTEM.USERS_DELETE) return header + "löschen";
  return header;
});

async function confirmDelete() {
  await userStore.deleteItem([route.params.id as string]);
  hideDialog();
}

const defaultUser: User = {
  id: "",
  email: "",
  lastName: "",
  firstName: "",
  displayName: "",
  password: "",
  role: Role.USER,
  createdAt: new Date(),
  updatedAt: null,
};

const formModel = ref<Record<string, any>>({ ...defaultUser });

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
      await userStore.fetchOnlyItem(id as string);

      // WICHTIG: Kopie, nicht Referenz!
      formModel.value = {
        ...userStore.item,
      };
    } else {
      formModel.value = { ...defaultUser };
    }
    isReady.value = true;
  },
  { immediate: true },
);

async function onSubmit() {
  if (mode.value === "create") {
    if (await userStore.createItem(formModel.value)) {
      autoCloseModal();
    }
  }

  if (mode.value === "edit") {
    if (await userStore.updateItem(formModel.value)) {
      autoCloseModal();
    }
  }
}

function autoCloseModal() {
  visible.value = !autoClose.value;
}

const formRef = ref<InstanceType<typeof FormGenerator> | null>(null);

const isLoading = computed(() => {
  switch (mode.value) {
    case "create":
      return userStore.creatingLoading;
    case "edit":
      return userStore.updatingLoading;
    case "delete":
      return userStore.deletingLoading;
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
      :fields="userFormFields"
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
