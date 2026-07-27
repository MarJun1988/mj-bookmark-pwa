<script lang="ts" setup>
import FormGenerator from "@/components/form/FormGenerator.vue";
import { useUserStore } from "@/stores/user.store.ts";
import { computed, type Ref, ref } from "vue";
import { useDashboardStore } from "@/stores/dashboard.store.ts";
import { useMutation } from "@vue/apollo-composable";
import { REQUEST_DATA_EXPORT } from "@/graphql/mutations/requestDataExport.ts";
import { useToastStore } from "@/stores/toast.store.ts";
import { userProfileExportDataFormFields } from "@/utils/forms/userProfileExportData.form.ts";

const userStore = useUserStore();
const dashboardStore = useDashboardStore();
const toastStore = useToastStore();
const isReady: Ref<boolean> = ref(true);

const formModel = ref<Record<string, any>>({ ...userStore.item });

const formRef = ref<InstanceType<typeof FormGenerator> | null>(null);

const stats = computed(() => dashboardStore.stats);

const { mutate: requestDataExport, loading: loadingExport } = useMutation(REQUEST_DATA_EXPORT);

const onSubmitExportData = async () => {
  try {
    const result = await requestDataExport({
      email: formModel.value.email,
      password: formModel.value.password,
    });

    if (result?.data.requestDataExport) {
      const file = result.data.requestDataExport;

      const blob = new Blob([Uint8Array.from(atob(file.contentBase64), (c) => c.charCodeAt(0))], {
        type: file.mimeType,
      });

      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = file.filename;
      a.click();

      URL.revokeObjectURL(url);

      toastStore.success({
        summary: "Export erstellt",
        detail: "Deine Daten wurden erfolgreich heruntergeladen.",
      });
    }
  } catch (err: unknown) {
    console.log("error", err);
    toastStore.error({
      summary: "Fehler",
      detail: "Der Export konnte nicht erstellt werden.",
    });
  }
};
</script>
<template>
  <div class="space-y-4 grid grid-cols-2 gap-2">
    <span class="font-semibold text-3xl text-center col-span-2">
      Deine Daten anfordern (DSGVO)</span
    >

    <p class="mb-3 col-span-2">
      Gemäß <b>Art. 15 DSGVO</b> hast du das Recht, Auskunft über die zu deiner Person gespeicherten
      Daten zu erhalten. Du kannst jederzeit eine Kopie deiner bei uns gespeicherten Daten
      anfordern.
    </p>

    <p class="mb-3 col-span-2">Der Export enthält alle Inhalte deines Kontos, darunter:</p>

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

    <p class="mt-3 text-sm col-span-2">
      Die Daten werden dir in strukturierter Form (JSON) bereitgestellt. Passwörter, Tokens oder
      andere sicherheitsrelevante Informationen sind nicht Bestandteil des Exports.
    </p>

    <Message class="col-span-2" icon="pi pi-shield" severity="info">
      Die Anforderung deiner Daten ist kostenlos und hat keine Auswirkungen auf dein Konto.
    </Message>

    <!-- einzelne Eingabefelder -->
    <FormGenerator
      ref="formRef"
      v-model="formModel"
      :fields="userProfileExportDataFormFields"
      :isReady="isReady"
      class="col-span-2"
      mode="edit"
      @submit="onSubmitExportData"
    />
    <!-- Fußzeile -->
    <div class="flex justify-end mt-4 col-span-2">
      <Button
        :disabled="loadingExport || !formRef?.isFormValid"
        :loading="loadingExport"
        icon="pi pi-download"
        label="Daten anfordern"
        @click="onSubmitExportData"
      />
    </div>
  </div>
</template>
