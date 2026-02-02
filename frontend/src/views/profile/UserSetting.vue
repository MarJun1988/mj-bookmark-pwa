<script lang="ts" setup>
import FormGenerator from "@/components/form/FormGenerator.vue";
import { useUserStore } from "@/stores/user.store.ts";
import { onMounted, type Ref, ref } from "vue";
import { useAuthStore } from "@/stores/auth.store.ts";
import { userProfileGeneralFormFields } from "@/utils/forms/userProfileGeneral.form.ts";
import { userProfilePasswordFields } from "@/utils/forms/userProfilePassword.form.ts";
import type { UserPassword } from "@/utils/interfaces.ts";

const userStore = useUserStore();
const authStore = useAuthStore();

const isReady = ref(false);

const formModel = ref<Record<string, any>>({ ...userStore.item });

const formModelPassword: Ref<UserPassword> = ref({
  id: "",
  oldPassword: "",
  newPassword: "",
  newPasswordReplay: "",
});

onMounted(async () => {
  if (authStore.user && authStore.user.id) {
    await userStore.fetchOnlyItem(authStore.user.id as string);

    // WICHTIG: Kopie, nicht Referenz!
    formModel.value = {
      ...userStore.item,
    };

    // WICHTIG: Kopie, nicht Referenz!
    formModelPassword.value.id = userStore.item.id;
  }
  isReady.value = true;
});

async function onSubmitGeneral() {
  await userStore.updateItem(formModel.value);
}
async function onSubmitPassword() {
  await userStore.updateItemPassword(formModelPassword.value);
}

const formRef = ref<InstanceType<typeof FormGenerator> | null>(null);
const formRef1 = ref<InstanceType<typeof FormGenerator> | null>(null);
</script>
<template>
  <Tabs
    class="w-full"
    value="0"
  >
    <TabList class="bg-(--p-surface-section)">
      <Tab value="0">
        allgemeines
      </Tab>
      <Tab value="1">
        Kennwort ändern
      </Tab>
    </TabList>
    <TabPanels class="bg-(--p-surface-section)">
      <TabPanel value="0">
        <!-- einzelne Eingabefelder -->
        <FormGenerator
          ref="formRef"
          v-model="formModel"
          :fields="userProfileGeneralFormFields"
          :isReady="isReady"
          mode="edit"
          @submit="onSubmitGeneral"
        />
        <!-- Fußzeile -->
        <div class="flex justify-end mt-4">
          <Button
            icon="pi pi-save"
            label="Speichern"
            :disabled="userStore.updatingLoading || !formRef?.isFormValid"
            :loading="userStore.updatingLoading"
            @click="onSubmitGeneral"
          />
        </div>
      </TabPanel>
      <TabPanel value="1">
        <!-- einzelne Eingabefelder -->
        <FormGenerator
          ref="formRef1"
          v-model="formModelPassword"
          :fields="userProfilePasswordFields"
          :isReady="isReady"
          mode="edit"
          @submit="onSubmitPassword"
        />
        <!-- Fußzeile -->
        <div class="flex justify-end mt-4">
          <Button
            icon="pi pi-save"
            label="Speichern"
            :disabled="
              userStore.updatingPasswordLoading || !formRef1?.isFormValid
            "
            :loading="userStore.updatingPasswordLoading"
            @click="onSubmitPassword"
          />
        </div>
      </TabPanel>
    </TabPanels>
  </Tabs>
</template>
