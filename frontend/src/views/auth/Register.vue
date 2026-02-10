<script lang="ts" setup>
import { computed, type Ref, ref } from "vue";
import { useMutation } from "@vue/apollo-composable";
import { useRouter } from "vue-router";
import { ApolloError } from "@apollo/client";
import { useNetworkStore } from "@/stores/network.store.ts";
import { REGISTER_USER_MUTATION } from "@/graphql/mutations/registerUser.ts";
import { type UserRegister } from "@/utils/interfaces.ts";
import FormGenerator from "@/components/form/FormGenerator.vue";
import { userRegisterFormFields } from "@/utils/forms/userRegister.form.ts";
import type { HintedString } from "@primevue/core";

const registerUser: Ref<UserRegister> = ref({
  email: "",
  lastName: "",
  firstName: "",
  displayName: "",
  password: "",
  passwordReplay: "",
});

const message = ref<string | null>(null);
const messageSeverity = ref<
  | HintedString<
      "success" | "info" | "warn" | "error" | "secondary" | "contrast"
    >
  | undefined
>("success");
const router = useRouter();

const { mutate, loading } = useMutation(REGISTER_USER_MUTATION);

const submit = async (): Promise<void> => {
  message.value = null;

  // 🔒 Client-Side Validierung
  if (!isEmailValid.value) {
    messageSeverity.value = "info";
    message.value = "Bitte eine gültige E-Mail-Adresse eingeben";
    return;
  }

  if (passwordError.value) {
    messageSeverity.value = "info";
    message.value = passwordError.value;
    return;
  }

  try {
    const result = await mutate({
      email: registerUser.value.email.trim().toLowerCase(),
      password: registerUser.value.password,
      passwordReplay: registerUser.value.passwordReplay,
      firstName: registerUser.value.firstName,
      lastName: registerUser.value.lastName,
      displayName: registerUser.value.displayName,
    });

    if (!result?.data?.registerUser) {
      messageSeverity.value = "error";
      message.value = "Registrierung fehlgeschlagen.";
      return;
    }

    messageSeverity.value = "success";
    message.value = `Dein Konto wurde erfolgreich erstellt.
Bitte bestätige jetzt deine E-Mail-Adresse.
Du wirst in 10 Sekunden zum Login weitergeleitet.`;

    setTimeout(function () {
      router.push("/login");
    }, 10000);
  } catch (err: unknown) {
    // ✅ Apollo GraphQL Fehler
    if (err instanceof ApolloError) {
      const code = err.graphQLErrors?.[0]?.extensions?.code;
      messageSeverity.value = "error";
      message.value = mapAuthError(code);
      return;
    }

    // 🔴 Fallback
    messageSeverity.value = "error";
    message.value = "Technischer Fehler bei der Registrierung.";
  }
};

const isEmailValid = computed(() =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerUser.value.email),
);

const mapAuthError = (code?: unknown): string => {
  switch (code) {
    case "AUTH_ACCOUNT_DISABLED":
      return "Dein Konto ist deaktiviert";

    case "AUTH_NOT_VERIFIED":
      return (
        "Bitte bestätige deine E-Mail-Adresse, bevor du dich anmeldest.\n" +
        "Wir haben dir dafür eine E-Mail geschickt."
      );

    case "EMAIL_ALREADY_EXISTS":
      return "Diese E-Mail-Adresse ist bereits registriert.";

    default:
      return "Registrierung fehlgeschlagen.";
  }
};

const network = useNetworkStore();

const isCheckPassword = computed(() => {
  return (
    registerUser.value.password.length >= 12 &&
    registerUser.value.password === registerUser.value.passwordReplay
  );
});

const passwordError = computed(() => {
  if (registerUser.value.password.length < 12) {
    return "Das Passwort muss mindestens 12 Zeichen lang sein.";
  }
  if (registerUser.value.password !== registerUser.value.passwordReplay) {
    return "Die Passwörter stimmen nicht überein.";
  }
  return null;
});

const formRef = ref<InstanceType<typeof FormGenerator> | null>(null);
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
      class="w-full max-w-xl shadow-xl rounded-2xl"
    >
      <template #content>
        <!-- Header -->
        <div class="text-center space-y-1">
          <h1 class="text-2xl font-semibold">
            Willkommen 👋
          </h1>
          <p class="text-sm text-surface-500">
            Erstelle jetzt dein neues Konto
          </p>
        </div>

        <!-- Fehler -->
        <Message
          v-if="message"
          :closable="false"
          :pt:text:class="'w-full text-center whitespace-pre-line'"
          :severity="messageSeverity"
        >
          {{ message }}
        </Message>

        <!-- einzelne Eingabefelder -->
        <FormGenerator
          ref="formRef"
          v-model="registerUser"
          :fields="userRegisterFormFields"
          :isReady="true"
          mode="edit"
          @submit="submit"
        />

        <!-- Registrieren -->
        <Button
          :disabled="!formRef?.isFormValid || !isCheckPassword"
          :loading="loading"
          class="md:order-2 lg:order-3"
          icon="pi pi-check"
          label="Registrieren"
          @click="submit"
        />

        <div class="flex justify-end col-span-2">
          <Button
            label="Bereits ein Konto? Anmelden"
            link
            @click="router.push('/login')"
          />
        </div>

        <!-- Footer -->
        <div class="text-center text-xs text-surface-500">
          © {{ new Date().getFullYear() }} · Bookmark App
        </div>
      </template>
    </Card>
  </div>
</template>
