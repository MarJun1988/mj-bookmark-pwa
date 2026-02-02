import { createApp } from "vue";
import { createPinia } from "pinia";
import PrimeVue from "primevue/config";

import "@/assets/styles/style.css";
import App from "./App.vue";
import { router } from "@/router";
import { ApolloClients } from "@vue/apollo-composable";
import { apolloClient } from "@/apollo/client";
import { MyThemeAura } from "@/assets/MyThemeAura.ts";
import { useTheme } from "@/composable/useTheme.ts";
import { de } from "primelocale/js/de.js";

import Tooltip from "primevue/tooltip";
import ToastService from "primevue/toastservice";
import { useNetworkStore } from "@/stores/network.store.ts";
import ConfirmationService from "primevue/confirmationservice";

// Abrufen des Themes
const { initTheme } = useTheme();
initTheme();

const app = createApp(App);

const pinia = createPinia();
app.use(pinia);
app.use(router);

const networkStore = useNetworkStore();
networkStore.init(); // 🔥 extrem wichtig

app.use(PrimeVue, {
  theme: {
    prefix: "p",
    preset: MyThemeAura,
    options: {
      darkModeSelector: ".dark",
      cssLayer: {
        name: "primevue",
        order: "theme, base, primevue",
      },
    },
    cssLayer: false,
  },
  locale: de,
});
app.provide(ApolloClients, {
  default: apolloClient,
});
app.use(ToastService);
app.directive("tooltip", Tooltip);
app.use(ConfirmationService);

app.mount("#app");