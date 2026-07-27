<script lang="ts" setup>
import FormGenerator from "@/components/form/FormGenerator.vue";
import { useUserStore } from "@/stores/user.store.ts";
import { computed, onMounted, type Ref, ref } from "vue";
import { useDashboardStore } from "@/stores/dashboard.store.ts";
import { useConfirm } from "primevue/useconfirm";
import { useMutation } from "@vue/apollo-composable";
import { DELETE_ACCOUNT } from "@/graphql/mutations/deleteAccount.ts";
import { userProfileDeleteAccountFormFields } from "@/utils/forms/userProfileDeleteAccount.form.ts";
import { router } from "@/router";
import { useToastStore } from "@/stores/toast.store.ts";
import { apolloClient } from "@/apollo/client.ts";
import { useNetworkStore } from "@/stores/network.store.ts";
import { useAuthStore } from "@/stores/auth.store.ts";

const authStore = useAuthStore();
const userStore = useUserStore();
const dashboardStore = useDashboardStore();
const toastStore = useToastStore();
const networkStore = useNetworkStore();

const isReady: Ref<boolean> = ref(true);
const formModel = ref<Record<string, any>>({ ...userStore.item });
const formRef = ref<InstanceType<typeof FormGenerator> | null>(null);

const stats = computed(() => dashboardStore.stats);

const confirm = useConfirm();

const { mutate: deleteAccount, loading: loadingDeleteAccount } = useMutation(DELETE_ACCOUNT);

const onSubmitDeleteAccount = () => {
  confirm.require({
    message: "Möchtest du dein Konto wirklich endgültig löschen?",
    header: "Letzte Warnung",
    icon: "pi pi-exclamation-triangle",
    acceptLabel: "Ja, alles löschen",
    rejectLabel: "Abbrechen",
    rejectProps: {
      label: "Abbrechen",
      severity: "secondary",
      outlined: true,
    },
    acceptProps: {
      label: "Ja, alles löschen",
      severity: "danger",
    },
    accept: async () => {
      try {
        const result = await deleteAccount({
          email: formModel.value.email,
          password: formModel.value.password,
        });

        if (result?.data?.deleteAccount) {
          // 💬 4️⃣ Optional: Toast
          toastStore.success({
            summary: "Konto gelöscht",
            detail: "Dein Konto wurde erfolgreich gelöscht.",
          });

          // 🧹 1️⃣ Stores zurücksetzen
          authStore.$reset();
          dashboardStore.$reset();
          networkStore.$reset(); // optional

          // 🧠 2️⃣ Apollo Cache leeren
          await apolloClient.clearStore();

          // 🚪 3️⃣ Redirect zum Login
          await router.replace("/login");
        }
      } catch (err: unknown) {
        console.error("deleteAccount failed", err);

        toastStore.error({
          summary: "Fehler",
          detail: "Das Konto konnte nicht gelöscht werden.",
        });
      }
    },
    reject: () => {},
  });
};

onMounted(async () => {
  await dashboardStore.bootstrapDashboard();
});
</script>
<template>
  <div class="space-y-4 grid grid-cols-2 gap-2">
    <span class="font-semibold text-3xl text-center col-span-2">
      Dein Konto endgültig löschen
    </span>

    <p class="mb-3 col-span-2">
      Wenn du dein Konto löschst, werden alle zugehörigen Daten dauerhaft entfernt. Dazu zählen
      insbesondere:
    </p>

    <ul class="ml-4 list-disc col-span-2">
      <li>
        <b>{{ stats.tabs }}</b> Tabs
      </li>
      <li>
        <b>{{ stats.groups }}</b> Gruppen
      </li>
      <li>
        <b>{{ stats.items }}</b> Einträge
      </li>
    </ul>

    <p class="mt-3 text-sm col-span-1">
      Wenn du deine Daten sichern möchtest, empfehlen wir dir, vor der Löschung zunächst den
      Datenexport zu nutzen.
    </p>
    <Message class="col-span-2" icon="pi pi-info-circle" severity="warn">
      Wenn du deine Daten sichern möchtest, empfehlen wir dir, vor der Löschung zunächst den
      Datenexport zu nutzen.
    </Message>

    <!-- einzelne Eingabefelder -->
    <FormGenerator
      ref="formRef"
      v-model="formModel"
      :fields="userProfileDeleteAccountFormFields"
      :isReady="isReady"
      class="col-span-2"
      mode="edit"
      @submit="onSubmitDeleteAccount"
    />
    <!-- Fußzeile -->
    <div class="flex justify-end mt-4 col-span-2">
      <Button
        :disabled="loadingDeleteAccount || !formRef?.isFormValid"
        :loading="loadingDeleteAccount"
        icon="pi pi-trash"
        label="Konto endgültig löschen"
        severity="danger"
        @click="onSubmitDeleteAccount"
      />
    </div>
  </div>
</template>
