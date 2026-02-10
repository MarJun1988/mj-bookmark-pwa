<script lang="ts" setup>
import FormGenerator from "@/components/form/FormGenerator.vue";
import { useUserStore } from "@/stores/user.store.ts";
import { onMounted, type Ref, ref } from "vue";
import { useAuthStore } from "@/stores/auth.store.ts";
import { userProfilePasswordFields } from "@/utils/forms/userProfilePassword.form.ts";
import type { UserPassword } from "@/utils/interfaces.ts";

const userStore = useUserStore();
const authStore = useAuthStore();
const isReady = ref(false);

const formModel: Ref<UserPassword> = ref({
  id: "",
  oldPassword: "",
  newPassword: "",
  newPasswordReplay: "",
});

onMounted(async () => {
  if (authStore.user && authStore.user.id) {
    await userStore.fetchOnlyItem(authStore.user.id as string);

    // WICHTIG: Kopie, nicht Referenz!
    formModel.value.id = userStore.item.id;
  }
  isReady.value = true;
});

async function onSubmitPassword() {
  await userStore.updateItemPassword(formModel.value);
}

const formRef = ref<InstanceType<typeof FormGenerator> | null>(null);
</script>
<template>
  <div class="space-y-4 grid grid-cols-2 gap-2">
    <span class="font-semibold text-3xl text-center col-span-2">
      Kennwort ändern
    </span>
    <p class="col-span-2 mb-4">
      Aus Sicherheitsgründen empfehlen wir, dein Kennwort regelmäßig zu ändern
      und ein starkes, einzigartiges Passwort zu verwenden.
    </p>
    <!-- einzelne Eingabefelder -->
    <FormGenerator
      ref="formRef"
      v-model="formModel"
      :fields="userProfilePasswordFields"
      :isReady="isReady"
      class="col-span-2"
      mode="edit"
      @submit="onSubmitPassword"
    />
    <!-- Fußzeile -->
    <div class="flex justify-end mt-4 col-span-2">
      <Button
        :disabled="userStore.updatingPasswordLoading || !formRef?.isFormValid"
        :loading="userStore.updatingPasswordLoading"
        icon="pi pi-save"
        label="Speichern"
        @click="onSubmitPassword"
      />
    </div>
  </div>
</template>
