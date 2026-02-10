<script lang="ts" setup>
import { computed, ref } from "vue";
import { useMutation } from "@vue/apollo-composable";
import { ApolloError } from "@apollo/client";
import { useUiStore } from "@/stores/ui.store";
import { useNetworkStore } from "@/stores/network.store";
import { router } from "@/router";
import { RESET_PASSWORD_MUTATION } from "@/graphql/mutations/resetPassword.ts";

const props = defineProps<{
  token?: string;
}>();

const password = ref("");
const passwordReplay = ref("");
const errorMessage = ref<string | null>(null);

const ui = useUiStore();
const network = useNetworkStore();

const { mutate, loading } = useMutation(RESET_PASSWORD_MUTATION);

const submit = async (): Promise<void> => {
  errorMessage.value = null;

  if (!props.token) {
    errorMessage.value = "Ungültiger oder abgelaufener Link.";
    return;
  }

  if (password.value !== passwordReplay.value) {
    errorMessage.value = "Passwörter stimmen nicht überein.";
    return;
  }

  try {
    const result = await mutate({
      token: props.token,
      newPassword: password.value,
      newPasswordReplay: passwordReplay.value,
    });

    if (!result?.data?.resetPassword) {
      errorMessage.value = "Passwortänderung fehlgeschlagen.";
      return;
    }

    // ✅ Erfolg → zurück zum Login
    await router.push("/login");
  } catch (err: unknown) {
    if (err instanceof ApolloError) {
      const code = err.graphQLErrors?.[0]?.extensions?.code;

      if (code === "TOKEN_EXPIRED" || code === "INVALID_TOKEN") {
        errorMessage.value = "Der Link ist ungültig oder abgelaufen.";
        return;
      }

      errorMessage.value = "Passwort konnte nicht geändert werden.";
      return;
    }

    errorMessage.value = "Technischer Fehler.";
  }
};

const isCheckPassword = computed(() => {
  return password.value.length >= 12 && password.value === passwordReplay.value;
});
</script>

<template>
  <div
    v-if="!network.online"
    class="min-h-screen w-full flex items-center justify-center bg-linear-to-br from-surface-50 to-surface-100 dark:from-surface-900 dark:to-surface-950 px-4 text-center p-6"
  >
    🔌 Du bist offline.<br>
    Anmeldung ist derzeit nicht möglich.
  </div>

  <div
    v-else
    class="min-h-screen w-full flex items-center justify-center bg-linear-to-br from-surface-50 to-surface-100 dark:from-surface-900 dark:to-surface-950 px-4"
  >
    <Card
      :pt="{
        body: 'p-8',
        content: 'space-y-6',
      }"
      class="w-full max-w-md shadow-xl rounded-2xl"
    >
      <template #content>
        <form
          class="space-y-6"
          @submit.prevent="submit"
        >
          <!-- Header -->
          <div class="text-center space-y-1">
            <h1 class="text-2xl font-semibold">
              Neues Passwort festlegen
            </h1>
            <p class="text-sm text-surface-500">
              Bitte vergebe jetzt ein neues, sicheres Passwort.
            </p>
          </div>

          <!-- Fehler -->
          <Message
            v-if="errorMessage"
            :closable="false"
            severity="error"
          >
            {{ errorMessage }}
          </Message>

          <!-- Password -->
          <FloatLabel
            :variant="ui.floatLabelVariant"
            class="w-full"
          >
            <Password
              id="password"
              v-model="password"
              :feedback="false"
              class="w-full"
              inputClass="w-full"
              toggleMask
            />
            <label for="password">Passwort</label>
          </FloatLabel>

          <!-- Passwort wiederholung -->
          <FloatLabel
            :variant="ui.floatLabelVariant"
            class="w-full"
          >
            <Password
              id="password-replay"
              v-model="passwordReplay"
              :feedback="false"
              class="w-full"
              inputClass="w-full"
              toggleMask
            />
            <label for="password-replay">Passwort wiederholung</label>
          </FloatLabel>

          <!-- Login Button -->
          <Button
            :disabled="!token || !isCheckPassword || loading"
            :loading="loading"
            class="w-full"
            icon="pi pi-sign-in"
            label="Absenden"
            size="large"
            type="submit"
          />

          <!-- Footer -->
          <div class="text-center text-xs text-surface-500">
            © {{ new Date().getFullYear() }} · Bookmark App
          </div>
        </form>
      </template>
    </Card>
  </div>
</template>
