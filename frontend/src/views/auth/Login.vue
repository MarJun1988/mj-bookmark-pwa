<script lang="ts" setup>
import { computed, ref } from "vue";
import { useMutation } from "@vue/apollo-composable";

import { LOGIN_MUTATION } from "@/graphql/mutations/login.ts";
import { useAuthStore } from "@/stores/auth.store.ts";
import { useRoute, useRouter } from "vue-router";
import { devLog } from "@/utils/utils.ts";
import { ApolloError } from "@apollo/client";
import { useUiStore } from "@/stores/ui.store.ts";
import { useNetworkStore } from "@/stores/network.store.ts";
import { REQUEST_PASSWORD_RESET_MUTATION } from "@/graphql/mutations/requestPasswordReset.ts";
import AppFooter from "@/components/AppFooter.vue";

const email = ref("");
const password = ref("");
const errorMessage = ref<string | null>(null);

const auth = useAuthStore();

const router = useRouter();
const route = useRoute();

const ui = useUiStore();

const { mutate, loading } = useMutation(LOGIN_MUTATION);

const submit = async (): Promise<void> => {
  errorMessage.value = null;

  // 🔒 Client-Side Validierung
  if (!email.value.trim() || !password.value) {
    errorMessage.value = "Bitte E-Mail und Passwort eingeben";
    return;
  }

  if (!isEmailValid.value) {
    errorMessage.value = "Bitte eine gültige E-Mail-Adresse eingeben";
    return;
  }

  try {
    const result = await mutate({
      email: email.value.trim().toLowerCase(),
      password: password.value,
    });

    if (!result?.data?.login) {
      errorMessage.value = "Login fehlgeschlagen";
      return;
    }

    auth.setAuth(result.data.login.accessToken, result.data.login.user);

    await router.replace(route.query.redirect?.toString() || "/");
  } catch (err: unknown) {
    devLog("Login.vue (submit)", err);

    // ✅ Apollo GraphQL Fehler
    if (err instanceof ApolloError) {
      const code = err.graphQLErrors?.[0]?.extensions?.code;
      errorMessage.value = mapAuthError(code);
      return;
    }

    // 🔴 Fallback
    errorMessage.value = "Technischer Fehler beim Login";
  }
};

const isEmailValid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value));

const isForgotEmailValid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail.value));
const showForgotDialog = ref(false);
const forgotEmail = ref("");
const forgotError = ref<string | null>(null);
const forgotSuccess = ref(false);

const { mutate: mutateRequestPassword, loading: loadingRequestPassword } = useMutation(
  REQUEST_PASSWORD_RESET_MUTATION,
);

const submitForgotPassword = async () => {
  forgotError.value = null;
  forgotSuccess.value = false;

  if (!isForgotEmailValid.value) {
    forgotError.value = "Bitte eine gültige E-Mail-Adresse eingeben";
    return;
  }

  try {
    await mutateRequestPassword({
      email: forgotEmail.value,
    });
    forgotSuccess.value = true;
  } catch (e) {
    devLog("Login.vue (submitForgotPassword)", e);
    forgotError.value = "Zurzeit konnte keine E-Mail versendet werden";
  } finally {
    // forgotSuccess.value =
    //   "   Wenn ein Konto existiert, wurde eine E-Mail versendet.\n" +
    //   "        Bitte prüfe dein Postfach.";
  }
};

const mapAuthError = (code?: unknown): string => {
  switch (code) {
    case "AUTH_INVALID_CREDENTIALS":
      return "E-Mail oder Passwort sind falsch";

    case "AUTH_ACCOUNT_DISABLED":
      return "Dein Konto ist deaktiviert";

    case "AUTH_NOT_VERIFIED":
      return (
        "Bitte bestätige deine E-Mail-Adresse, bevor du dich anmeldest.\n" +
        "Wir haben dir dafür eine E-Mail geschickt."
      );

    default:
      return "Login fehlgeschlagen";
  }
};

const network = useNetworkStore();
</script>

<template>
  <div
    v-if="!network.online"
    class="min-h-screen w-full flex items-center justify-center bg-linear-to-br from-surface-50 to-surface-100 dark:from-surface-900 dark:to-surface-950 px-4 text-center p-6"
  >
    🔌 Du bist offline.<br />
    Anmeldung ist derzeit nicht möglich.
  </div>

  <div
    v-else
    class="min-h-screen w-full flex items-center justify-center bg-linear-to-br from-surface-50 to-surface-100 dark:from-surface-900 dark:to-surface-950 px-4"
  >
    <!-- Wrapper für Card + Footer -->
    <div class="w-full max-w-md">
      <Card
        :pt="{
          body: 'p-8',
          content: 'space-y-6',
        }"
        class="w-full max-w-md shadow-xl rounded-2xl"
      >
        <template #content>
          <form class="space-y-6" @submit.prevent="submit">
            <!-- Header -->
            <div class="text-center space-y-1">
              <h1 class="text-2xl font-semibold">Willkommen zurück 👋</h1>
              <p class="text-sm text-surface-500">Melde dich mit deinem Account an</p>
            </div>

            <!-- Fehler -->
            <Message v-if="errorMessage" :closable="false" severity="error">
              {{ errorMessage }}
            </Message>

            <!-- E-Mail -->
            <FloatLabel :variant="ui.floatLabelVariant" class="w-full mt-10">
              <InputText
                id="email"
                v-model="email"
                :invalid="email.length > 0 && !isEmailValid"
                autocomplete="email"
                class="w-full"
                type="email"
              />
              <label for="email">E-Mail</label>
              <!-- Fehlermeldung -->
              <small v-if="email.length > 0 && !isEmailValid" class="text-red-500 text-xs">
                Bitte eine gültige E-Mail-Adresse eingeben
              </small>
            </FloatLabel>

            <!-- Passwort -->
            <FloatLabel :variant="ui.floatLabelVariant" class="w-full">
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

            <!-- Login Button -->
            <Button
              :disabled="!isEmailValid || !password"
              :loading="loading"
              class="w-full"
              icon="pi pi-sign-in"
              label="Login"
              size="large"
              type="submit"
            />

            <div class="flex justify-between">
              <Button label="Konto erstellen" link @click="router.push('/register')" />

              <Button
                class="text-surface-500"
                label="Passwort vergessen"
                link
                @click="showForgotDialog = true"
              />
            </div>

            <!-- Footer -->
            <div class="text-center text-xs text-surface-500">
              © {{ new Date().getFullYear() }} · Bookmark App
            </div>
          </form>
        </template>
      </Card>

      <!-- 🔽 Footer DIREKT unter der Card -->
      <AppFooter :show-project-name="false" width-class="w-12/12" />
    </div>
  </div>

  <Dialog v-model:visible="showForgotDialog" modal>
    <div class="space-y-4">
      <p class="text-sm text-surface-500">
        Gib deine E-Mail-Adresse ein. Wir senden dir einen Link zum Zurücksetzen deines Passworts.
      </p>

      <!-- Erfolg -->
      <Message v-if="forgotSuccess" :closable="false" severity="success">
        Wenn ein Konto existiert, wurde eine E-Mail versendet.
      </Message>

      <!-- Fehler -->
      <Message v-if="forgotError" :closable="false" severity="error">
        {{ forgotError }}
      </Message>

      <!-- E-Mail -->
      <div v-if="!forgotSuccess" class="space-y-1">
        <FloatLabel :variant="ui.floatLabelVariant" class="w-full">
          <InputText
            id="forgotEmail"
            v-model="forgotEmail"
            :invalid="forgotEmail.length > 0 && !isForgotEmailValid"
            class="w-full"
            type="email"
          />
          <label for="forgotEmail">E-Mail</label>
        </FloatLabel>

        <small v-if="forgotEmail.length > 0 && !isForgotEmailValid" class="text-red-500 text-xs">
          Bitte eine gültige E-Mail-Adresse eingeben
        </small>
      </div>
    </div>

    <template #footer>
      <Button
        label="Link senden"
        :disabled="loadingRequestPassword"
        :loading="loadingRequestPassword"
        @click="submitForgotPassword"
      />
    </template>
  </Dialog>
</template>
