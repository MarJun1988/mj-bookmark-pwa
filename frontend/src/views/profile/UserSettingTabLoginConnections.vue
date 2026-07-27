<script lang="ts" setup>
import { computed, ref } from "vue";
import { ApolloError } from "@apollo/client";
import { useMutation, useQuery } from "@vue/apollo-composable";
import FormGenerator from "@/components/form/FormGenerator.vue";
import {
  OIDC_CONNECTIONS_QUERY,
  UNLINK_OIDC_IDENTITY_MUTATION,
} from "@/graphql/oidcConnections.ts";
import { useToastStore } from "@/stores/toast.store.ts";
import { useAuthStore } from "@/stores/auth.store.ts";
import {
  type OidcUnlinkFormModel,
  userProfileOidcUnlinkFields,
} from "@/utils/forms/userProfileOidcUnlink.form.ts";

type OidcIdentity = {
  id: string;
  issuer: string;
  createdAt: string;
};

const unlinkDialogVisible = ref(false);
const selectedIdentity = ref<OidcIdentity | null>(null);
const unlinkError = ref<string | null>(null);
const toastStore = useToastStore();
const authStore = useAuthStore();
const unlinkFormRef = ref<InstanceType<typeof FormGenerator> | null>(null);
const unlinkFormModel = ref<OidcUnlinkFormModel>({
  passwordLoginEnabled: false,
  currentPassword: "",
  newPassword: "",
  newPasswordReplay: "",
});

const {
  result: oidcResult,
  loading: oidcLoading,
  refetch: refetchOidc,
} = useQuery(OIDC_CONNECTIONS_QUERY);
const { mutate: unlinkIdentity, loading: unlinking } = useMutation(UNLINK_OIDC_IDENTITY_MUTATION);

const oidcIdentities = computed<OidcIdentity[]>(() => oidcResult.value?.myOidcIdentities ?? []);
const passwordLoginEnabled = computed(() => oidcResult.value?.me?.passwordLoginEnabled === true);

function providerName(issuer: string): string {
  try {
    return new URL(issuer).hostname;
  } catch {
    return "Authentik";
  }
}

function openUnlinkDialog(identity: OidcIdentity) {
  selectedIdentity.value = identity;
  unlinkFormModel.value = {
    passwordLoginEnabled: passwordLoginEnabled.value,
    currentPassword: "",
    newPassword: "",
    newPasswordReplay: "",
  };
  unlinkError.value = null;
  unlinkDialogVisible.value = true;
}

async function confirmUnlink() {
  if (!selectedIdentity.value) return;

  unlinkError.value = null;
  if (!unlinkFormModel.value.passwordLoginEnabled) {
    if (unlinkFormModel.value.newPassword.length < 12) {
      unlinkError.value = "Das neue Passwort muss mindestens 12 Zeichen lang sein.";
      return;
    }
    if (unlinkFormModel.value.newPassword !== unlinkFormModel.value.newPasswordReplay) {
      unlinkError.value = "Die neuen Passwörter stimmen nicht überein.";
      return;
    }
  }

  try {
    await unlinkIdentity({
      id: selectedIdentity.value.id,
      currentPassword: unlinkFormModel.value.passwordLoginEnabled
        ? unlinkFormModel.value.currentPassword
        : null,
      newPassword: unlinkFormModel.value.passwordLoginEnabled
        ? null
        : unlinkFormModel.value.newPassword,
      newPasswordReplay: unlinkFormModel.value.passwordLoginEnabled
        ? null
        : unlinkFormModel.value.newPasswordReplay,
    });
    await refetchOidc();
    unlinkDialogVisible.value = false;
    toastStore.success({
      summary: "Authentik-Verknüpfung entfernt",
      detail: "Du kannst dich weiterhin mit deinem lokalen Passwort anmelden.",
    });
  } catch (error: unknown) {
    if (error instanceof ApolloError) {
      const code = error.graphQLErrors?.[0]?.extensions?.code;
      unlinkError.value =
        code === "OIDC_CURRENT_PASSWORD_INVALID"
          ? "Das aktuelle Passwort ist nicht korrekt."
          : "Die Verknüpfung konnte nicht entfernt werden.";
      return;
    }
    unlinkError.value = "Die Verknüpfung konnte nicht entfernt werden.";
  }
}
</script>

<template>
  <div class="space-y-4">
    <h1 class="font-semibold text-3xl text-center">Anmeldekonten</h1>
    <p class="mb-4">
      Hier kannst du externe Konten verwalten, die mit deinem Benutzerkonto verbunden sind.
    </p>

    <ProgressSpinner v-if="oidcLoading" class="w-8 h-8" strokeWidth="6" />

    <Message v-else-if="oidcIdentities.length === 0" :closable="false" severity="secondary">
      Aktuell ist kein Authentik-Konto verknüpft.
    </Message>

    <div v-else class="space-y-3">
      <Message v-if="!authStore.localAuthEnabled" :closable="false" severity="info">
        Das Entfernen ist deaktiviert, solange die lokale Anmeldung abgeschaltet ist.
      </Message>

      <div
        v-for="identity in oidcIdentities"
        :key="identity.id"
        class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-surface-200 dark:border-surface-700 p-4"
      >
        <div>
          <div class="font-medium flex items-center gap-2">
            <i class="pi pi-shield" />
            Authentik
          </div>
          <div class="text-sm text-surface-500 mt-1">
            {{ providerName(identity.issuer) }}
          </div>
        </div>
        <Button
          v-if="authStore.localAuthEnabled"
          icon="pi pi-unlink"
          label="Verknüpfung entfernen"
          severity="danger"
          outlined
          @click="openUnlinkDialog(identity)"
        />
      </div>
    </div>
  </div>

  <Dialog
    v-model:visible="unlinkDialogVisible"
    :closable="!unlinking"
    :style="{ width: 'min(32rem, 92vw)' }"
    header="Authentik-Verknüpfung entfernen"
    modal
  >
    <div class="space-y-4">
      <Message :closable="false" severity="warn">
        Nach dem Entfernen ist die Anmeldung über dieses Authentik-Konto nicht mehr möglich.
      </Message>

      <p v-if="passwordLoginEnabled" class="text-sm text-surface-600 dark:text-surface-300">
        Bestätige die Änderung mit deinem aktuellen lokalen Passwort.
      </p>
      <p v-else class="text-sm text-surface-600 dark:text-surface-300">
        Dein Konto besitzt noch kein lokales Passwort. Lege jetzt eines fest, damit du dich nach dem
        Trennen weiterhin anmelden kannst.
      </p>

      <FormGenerator
        ref="unlinkFormRef"
        v-model="unlinkFormModel"
        :fields="userProfileOidcUnlinkFields"
        :isReady="true"
        mode="delete"
        @submit="confirmUnlink"
      />

      <Message v-if="unlinkError" :closable="false" severity="error">
        {{ unlinkError }}
      </Message>
    </div>

    <template #footer>
      <Button
        :disabled="unlinking"
        label="Abbrechen"
        severity="secondary"
        text
        @click="unlinkDialogVisible = false"
      />
      <Button
        :disabled="!unlinkFormRef?.isFormValid"
        :loading="unlinking"
        icon="pi pi-unlink"
        label="Verknüpfung entfernen"
        severity="danger"
        @click="confirmUnlink"
      />
    </template>
  </Dialog>
</template>
