import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import Components from "unplugin-vue-components/vite";
import { PrimeVueResolver } from "@primevue/auto-import-resolver";
import vueDevTools from "vite-plugin-vue-devtools";
import { fileURLToPath } from "node:url";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  plugins: [
    vue(),
    vueDevTools({
      launchEditor: "webstorm",
    }),
    Components({
      resolvers: [PrimeVueResolver()],
    }),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["offline.html"],
      manifest: {
        name: "Bookmark Dashboard",
        short_name: "Bookmarks",
        start_url: "/",
        display: "standalone",
        background_color: "#0f172a",
        theme_color: "#0f172a",
      },
      workbox: {
        // ⛔ NICHT pauschal offline.html!
        navigateFallback: "/index.html",

        // 🔌 Login explizit ausnehmen
        navigateFallbackDenylist: [
          /^\/login/,
          /^\/api/,
          /^\/help/, // 🔥 DAS FEHLT
        ],

        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith("/help"),
            handler: "NetworkOnly",
          },
          // 🖼 Favicons
          {
            urlPattern: ({ url }) => url.pathname.startsWith("/favicons/"),
            handler: "CacheFirst",
            options: {
              cacheName: "favicons",
              expiration: {
                maxEntries: 300,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },

          // 📦 Statische Assets (Bilder, Fonts, etc.)
          {
            urlPattern: ({ request }) =>
              request.destination === "image" || request.destination === "font",
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "assets",
              expiration: {
                maxEntries: 500,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },
        ],
      },
    }),
  ],
  server: {
    port: 5173,
    // https: {
    //     key: fs.readFileSync(
    //         path.resolve(__dirname, 'certs/macbook-pro.junghans.internal.key')
    //     ),
    //     cert: fs.readFileSync(
    //         path.resolve(__dirname, 'certs/macbook-pro.junghans.internal.crt')
    //     ),
    // },
    host: "0.0.0.0",
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
        secure: false,
        ws: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
      "/favicons": "http://localhost:4000",
    },
  },
});
