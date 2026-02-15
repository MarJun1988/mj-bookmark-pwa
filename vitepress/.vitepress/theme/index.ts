// https://vitepress.dev/guide/custom-theme
import { h } from "vue";
import type { Theme } from "vitepress";
import { useRoute } from "vitepress";
import DefaultTheme from "vitepress/theme";
import "./style.css";

// Image-Viewer Plugin
import "viewerjs/dist/viewer.min.css";
import imageViewer from "vitepress-plugin-image-viewer";
import vImageViewer from "vitepress-plugin-image-viewer/lib/vImageViewer.vue";
// PrimeVue
import { MyThemeAura } from "./MyThemeAura.ts";
import PrimeVue from "primevue/config";
import { de } from "primelocale/js/de.js";
// PrimeVue Styles
import Button from "primevue/button";

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
    });
  },
  enhanceApp(ctx) {
    DefaultTheme.enhanceApp(ctx);
    // Image-Viewer Plugin
    ctx.app.component("vImageViewer", vImageViewer);
    // PrimeVue
    ctx.app.use(PrimeVue, {
      // Default theme configuration
      theme: {
        preset: MyThemeAura,
        options: {
          prefix: "p",
          //   darkModeSelector: 'system',
          darkModeSelector: ".dark",
          cssLayer: true,
        },
      },
      locale: de,
    });
    ctx.app.component("Button", Button);
    // ...
  },
  setup() {
    // Get route
    const route = useRoute();
    // Using
    imageViewer(route);
  },
  // enhanceApp({app, router, siteData}) {
  //     app.use(PrimeVue, {
  //         // Default theme configuration
  //         theme: {
  //             preset: MyPreset,
  //             options: {
  //                 prefix: 'p',
  //                 //   darkModeSelector: 'system',
  //                 darkModeSelector: '.dark',
  //                 cssLayer: false,
  //             },
  //         },
  //         locale: de,
  //     })
  //     app.component('Button', Button);
  //     app.use(imageViewer)
  //
  //     // ...
  // }
} satisfies Theme;
