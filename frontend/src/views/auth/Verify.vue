<script lang="ts" setup>
import { onMounted, ref } from "vue";
import { useMutation } from "@vue/apollo-composable";
import { ApolloError } from "@apollo/client";
import { useNetworkStore } from "@/stores/network.store";
import { router } from "@/router";
import { VERIFY_EMAIL } from "@/graphql/mutations/verifyEMail.ts";

const props = defineProps<{
  token?: string;
}>();

const network = useNetworkStore();

const errorMessage = ref<string | null>(null);
const success = ref(false);

const { mutate } = useMutation(VERIFY_EMAIL);

const submit = async (): Promise<void> => {
  errorMessage.value = null;
  try {
    const result = await mutate({
      token: props.token,
    });

    if (!result?.data?.verifyEmail) {
      errorMessage.value = "E-Mail-Bestätigung fehlgeschlagen.";
      return;
    }

    success.value = true;

    // ✅ Erfolg → zurück zum Login
    setTimeout(() => {
      router.push("/login");
    }, 3000);
  } catch (err: unknown) {
    if (err instanceof ApolloError) {
      const code = err.graphQLErrors?.[0]?.extensions?.code;

      if (code === "TOKEN_EXPIRED" || code === "INVALID_TOKEN") {
        errorMessage.value =
          "Der Bestätigungslink ist ungültig oder abgelaufen.";

        return;
      }

      return;
    }

    errorMessage.value = "Die Bestätigung konnte nicht durchgeführt werden.";
  }
};

onMounted(() => {
  if (!props.token) {
    errorMessage.value = "Der Bestätigungslink ist ungültig oder abgelaufen.";

    return;
  }
  submit();
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
              {{ success ? "E-Mail-Adresse bestätigt" : "E-Mail-Bestätigung" }}
            </h1>

            <p
              v-if="success"
              class="text-sm text-surface-500"
            >
              Dein Konto wurde erfolgreich aktiviert. Du kannst dich jetzt
              anmelden. Weiterleitung erfolgt in 3 Sekunden.
            </p>

            <p
              v-else
              class="text-sm text-surface-500"
            >
              Wir prüfen gerade deinen Bestätigungslink.
            </p>
          </div>

          <!-- Fehler -->
          <Message
            v-if="errorMessage"
            :closable="false"
            severity="error"
            :pt:text:class="'w-full text-center'"
          >
            {{ errorMessage }}
          </Message>

          <div class="flex justify-end col-span-2">
            <Button
              label="Zur Anmeldung"
              link
              @click="router.push('/login')"
            />
          </div>

          <!-- Footer -->
          <div class="text-center text-xs text-surface-500">
            © {{ new Date().getFullYear() }} · Bookmark App
          </div>
        </form>
      </template>
    </Card>
  </div>
</template>
