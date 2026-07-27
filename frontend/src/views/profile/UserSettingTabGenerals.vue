<script lang="ts" setup>
import FormGenerator from "@/components/form/FormGenerator.vue";
import { useUserStore } from "@/stores/user.store.ts";
import { onMounted, ref } from "vue";
import { useAuthStore } from "@/stores/auth.store.ts";
import { userProfileGeneralFormFields } from "@/utils/forms/userProfileGeneral.form.ts";

const userStore = useUserStore();
const authStore = useAuthStore();
const isReady = ref(false);

const formModel = ref<Record<string, any>>({ ...userStore.item });

onMounted(async () => {
  if (authStore.user && authStore.user.id) {
    await userStore.fetchOnlyItem(authStore.user.id as string);

    // WICHTIG: Kopie, nicht Referenz!
    formModel.value = {
      ...userStore.item,
    };
  }
  isReady.value = true;
});

async function onSubmitGeneral() {
  await userStore.updateItem(formModel.value);
}

const formRef = ref<InstanceType<typeof FormGenerator> | null>(null);
</script>
<template>
  <div class="space-y-4 grid grid-cols-2 gap-2">
    <span class="font-semibold text-3xl text-center col-span-2">
      Allgemeine Kontoeinstellungen
    </span>
    <p class="col-span-2 mb-4">
      Hier kannst du deine grundlegenden Kontoinformationen verwalten und bei Bedarf anpassen.
    </p>
    <!-- einzelne Eingabefelder -->
    <FormGenerator
      ref="formRef"
      v-model="formModel"
      :fields="userProfileGeneralFormFields"
      :isReady="isReady"
      class="col-span-2"
      mode="edit"
      @submit="onSubmitGeneral"
    />
    <!-- Fußzeile -->
    <div class="flex justify-end mt-4 col-span-2">
      <Button
        :disabled="userStore.updatingLoading || !formRef?.isFormValid"
        :loading="userStore.updatingLoading"
        icon="pi pi-save"
        label="Speichern"
        @click="onSubmitGeneral"
      />
    </div>
  </div>
</template>
