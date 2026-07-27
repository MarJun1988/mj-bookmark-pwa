import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth.store.ts";
import { ROUTE } from "@/utils/router.names.ts";
import { useNetworkStore } from "@/stores/network.store.ts";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: ROUTE.HOME,
      meta: { requiresAuth: true, title: "Home" },
      redirect: "/dashboard",
    },
    {
      path: "/dashboard",
      name: ROUTE.DASHBOARD,
      component: () => import("@/views/Dashboard.vue"),
      meta: { requiresAuth: true, title: "Dashboard" },
    },
    // Auth & Register
    {
      path: "/login",
      name: ROUTE.LOGIN,
      components: {
        loginView: () => import("@/views/auth/Login.vue"),
      },
      meta: { requiresAuth: false, title: "Login" },
    },
    {
      path: "/reset-password",
      name: ROUTE.RESET_PASSWORD,
      components: {
        loginView: () => import("@/views/auth/ResetPassword.vue"),
      },
      props: {
        loginView: (route) => ({
          token: route.query.token,
        }),
      },
      meta: { requiresAuth: false, localAuthOnly: true, title: "Passwort zurücksetzen" },
    },
    {
      path: "/register",
      name: ROUTE.REGISTER,
      components: {
        loginView: () => import("@/views/auth/Register.vue"),
      },
      meta: { requiresAuth: false, localAuthOnly: true, title: "Registrieren" },
    },
    {
      path: "/verify",
      name: ROUTE.VERIFY,
      components: {
        loginView: () => import("@/views/auth/Verify.vue"),
      },
      props: {
        loginView: (route) => ({
          token: route.query.token,
        }),
      },
      meta: { requiresAuth: false, title: "Konto bestätigen" },
    },
    // Profile
    {
      path: "/profile",
      name: ROUTE.PROFILE.ROOT,
      component: () => import("@/views/profile/UserSetting.vue"),
      meta: { requiresAuth: true, title: "Profil" },
      redirect: "/profile/account-settings",
      children: [
        {
          path: "account-settings",
          name: ROUTE.PROFILE.ACCOUNT_SETTINGS,
          component: () => import("@/views/profile/UserSettingTabGenerals.vue"),
          meta: {
            title: "Kontoeinstellungen",
            tab: true,
            icon: "pi pi-user-edit",
          },
        },
        {
          path: "login-connections",
          name: ROUTE.PROFILE.LOGIN_CONNECTIONS,
          component: () => import("@/views/profile/UserSettingTabLoginConnections.vue"),
          meta: {
            title: "Anmeldekonten",
            tab: true,
            icon: "pi pi-link",
          },
        },
        {
          path: "import-export",
          name: ROUTE.PROFILE.IMPORT_EXPORT,
          component: () => import("@/views/profile/UserSettingTabExportImport.vue"),
          meta: { title: "Inport / Export", tab: true, icon: "pi pi-sync" },
        },
        {
          path: "password",
          name: ROUTE.PROFILE.PASSWORD,
          component: () => import("@/views/profile/UserSettingTabPassword.vue"),
          meta: {
            title: "Kennwort ändern",
            tab: true,
            localAuthOnly: true,
            icon: "pi pi-lock",
          },
        },
        {
          path: "request-gdpr-data",
          name: ROUTE.PROFILE.REQUEST_GDPR_DATA,
          component: () => import("@/views/profile/UserSettingTabDSGVO.vue"),
          meta: {
            title: "Daten anfordern (DSGVO)",
            tab: true,
            icon: "pi pi-file-export",
          },
        },
        {
          path: "delete-account",
          name: ROUTE.PROFILE.DELETE_ACCOUNT,
          component: () => import("@/views/profile/UserSettingTabAccountDeleted.vue"),
          meta: { title: "Konto löschen", tab: true, icon: "pi pi-user-minus" },
        },
      ],
    },
    // Content
    {
      path: "/content",
      name: ROUTE.CONTENT.ROOT,
      component: () => import("@/views/content/Content.vue"),
      meta: { requiresAuth: true, title: "Inhalte" },
      redirect: "/content/items",
      children: [
        // =======================
        // TABS
        // =======================
        {
          path: "tabs",
          name: ROUTE.CONTENT.TABS,
          component: () => import("@/views/content/tabs/TabsOverview.vue"),
          meta: { title: "Tabs", tab: true, icon: "pi pi-folder" },
        },
        {
          path: "tabs/new",
          name: ROUTE.CONTENT.TABS_NEW,
          components: {
            default: () => import("@/views/content/tabs/TabsOverview.vue"),
            dialog: () => import("@/views/content/tabs/TabFormDialog.vue"),
          },
          props: {
            dialog: { mode: "new" },
          },
          meta: { title: "Tab anlegen" },
        },
        {
          path: "tabs/:id/edit",
          name: ROUTE.CONTENT.TABS_EDIT,
          components: {
            default: () => import("@/views/content/tabs/TabsOverview.vue"),
            dialog: () => import("@/views/content/tabs/TabFormDialog.vue"),
          },
          props: {
            dialog: (route) => ({
              mode: "edit",
              id: route.params.id,
            }),
          },
          meta: { title: "Tab bearbeiten" },
        },
        {
          path: "tabs/:id/delete",
          name: ROUTE.CONTENT.TABS_DELETE,
          components: {
            default: () => import("@/views/content/tabs/TabsOverview.vue"),
            dialog: () => import("@/views/content/tabs/TabFormDialog.vue"),
          },
          props: {
            default: false,
            dialog: (route: any) => ({ id: route.params.id }),
          },
          meta: { title: "Tab löschen" },
        },

        // =======================
        // GROUPS
        // =======================
        {
          path: "groups",
          name: ROUTE.CONTENT.GROUPS,
          component: () => import("@/views/content/groups/GroupsOverview.vue"),
          meta: {
            title: "Gruppen",
            tab: true,
            icon: "pi pi-sitemap",
          },
        },
        {
          path: "groups/new",
          name: ROUTE.CONTENT.GROUPS_NEW,
          components: {
            default: () => import("@/views/content/groups/GroupsOverview.vue"),
            dialog: () => import("@/views/content/groups/GroupFormDialog.vue"),
          },
          props: {
            dialog: (route) => {
              const tabId = typeof route.query.tabId === "string" ? route.query.tabId : null;

              const groupId = typeof route.query.groupId === "string" ? route.query.groupId : null;

              return {
                mode: "new",
                tabId,
                parentGroupId: groupId,
              };
            },
          },
          meta: { title: "Gruppe anlegen" },
        },
        {
          path: "groups/:id/edit",
          name: ROUTE.CONTENT.GROUPS_EDIT,
          components: {
            default: () => import("@/views/content/groups/GroupsOverview.vue"),
            dialog: () => import("@/views/content/groups/GroupFormDialog.vue"),
          },
          props: {
            dialog: (route) => ({
              mode: "edit",
              id: route.params.id,
            }),
          },
          meta: { title: "Gruppe bearbeiten" },
        },
        {
          path: "groups/:id/delete",
          name: ROUTE.CONTENT.GROUPS_DELETE,
          components: {
            default: () => import("@/views/content/groups/GroupsOverview.vue"),
            dialog: () => import("@/views/content/groups/GroupFormDialog.vue"),
          },
          props: {
            default: false,
            dialog: (route: any) => ({ id: route.params.id }),
          },
          meta: { title: "Gruppe löschen" },
        },

        // =======================
        // ITEMS
        // =======================
        {
          path: "items",
          name: ROUTE.CONTENT.ITEMS,
          component: () => import("@/views/content/items/ItemsOverview.vue"),
          meta: { title: "Einträge", tab: true, icon: "pi pi-bookmark" },
        },
        {
          path: "items/new",
          name: ROUTE.CONTENT.ITEMS_NEW,
          components: {
            default: () => import("@/views/content/items/ItemsOverview.vue"),
            dialog: () => import("@/views/content/items/ItemFormDialog.vue"),
          },
          props: {
            dialog: (route) => {
              const tabId = typeof route.query.tabId === "string" ? route.query.tabId : null;

              const groupId = typeof route.query.groupId === "string" ? route.query.groupId : null;

              return {
                default: false,
                mode: "new",
                tabId,
                parentGroupId: groupId,
              };
            },
          },
          meta: { title: "Eintrag anlegen" },
        },
        {
          path: "items/:id/edit",
          name: ROUTE.CONTENT.ITEMS_EDIT,
          components: {
            default: () => import("@/views/content/items/ItemsOverview.vue"),
            dialog: () => import("@/views/content/items/ItemFormDialog.vue"),
          },
          props: {
            default: false,
            dialog: (route) => ({
              mode: "edit",
              id: route.params.id,
            }),
          },
          meta: { title: "Eintrag bearbeiten" },
        },
        {
          path: "items/:id/delete",
          name: ROUTE.CONTENT.ITEMS_DELETE,
          components: {
            default: () => import("@/views/content/items/ItemsOverview.vue"),
            dialog: () => import("@/views/content/items/ItemFormDialog.vue"),
          },
          props: {
            default: false,
            dialog: (route: any) => ({ id: route.params.id }),
          },
          meta: { title: "Eintrag löschen" },
        },
      ],
    },
    // System
    {
      path: "/system",
      name: ROUTE.SYSTEM.ROOT,
      component: () => import("@/views/system/System.vue"),
      meta: {
        requiresAuth: true,
        requiresAdmin: true,
        title: "System",
      },
      redirect: "/system/users",
      children: [
        // =======================
        // USERS
        // =======================
        {
          path: "users",
          name: ROUTE.SYSTEM.ACCOUNT_SETTINGS,
          component: () => import("@/views/system/users/UsersOverview.vue"),
          meta: { title: "Nutzer", tab: true, icon: "pi pi-users" },
        },
        {
          path: "users/new",
          name: ROUTE.SYSTEM.USERS_NEW,
          components: {
            default: () => import("@/views/system/users/UsersOverview.vue"),
            dialog: () => import("@/views/system/users/UserFormDialog.vue"),
          },
          meta: { title: "Nutzer anlegen" },
        },
        {
          path: "users/:id/edit",
          name: ROUTE.SYSTEM.USERS_EDIT,
          components: {
            default: () => import("@/views/system/users/UsersOverview.vue"),
            dialog: () => import("@/views/system/users/UserFormDialog.vue"),
          },
          props: {
            dialog: (route) => ({
              id: route.params.id,
            }),
          },
          meta: { title: "Nutzer bearbeiten" },
        },
        {
          path: "users/:id/delete",
          name: ROUTE.SYSTEM.USERS_DELETE,
          components: {
            default: () => import("@/views/system/users/UsersOverview.vue"),
            dialog: () => import("@/views/system/users/UserFormDialog.vue"),
          },
          props: {
            dialog: (route) => ({
              id: route.params.id,
            }),
          },
          meta: { title: "Nutzer löschen" },
        },

        // =======================
        // TAGS
        // =======================
        {
          path: "tags",
          name: ROUTE.SYSTEM.TAGS,
          component: () => import("@/views/system/tags/TagsOverview.vue"),
          meta: { title: "Tags", tab: true, icon: "pi pi-tags" },
        },
        {
          path: "tags/new",
          name: ROUTE.SYSTEM.TAGS_NEW,
          components: {
            default: () => import("@/views/system/tags/TagsOverview.vue"),
            dialog: () => import("@/views/system/tags/TagFormDialog.vue"),
          },
          meta: { title: "Tag anlegen" },
        },
        {
          path: "tags/:id/edit",
          name: ROUTE.SYSTEM.TAGS_EDIT,
          components: {
            default: () => import("@/views/system/tags/TagsOverview.vue"),
            dialog: () => import("@/views/system/tags/TagFormDialog.vue"),
          },
          props: {
            dialog: (route) => ({
              id: route.params.id,
            }),
          },
          meta: { title: "Tag bearbeiten" },
        },
        {
          path: "tags/:id/delete",
          name: ROUTE.SYSTEM.TAGS_DELETE,
          components: {
            default: () => import("@/views/system/tags/TagsOverview.vue"),
            dialog: () => import("@/views/system/tags/TagFormDialog.vue"),
          },
          props: {
            dialog: (route) => ({
              id: route.params.id,
            }),
          },
          meta: { title: "Tag löschen" },
        },

        // =======================
        // VERSIONS
        // =======================
        {
          path: "versions",
          name: ROUTE.SYSTEM.VERSIONS,
          component: () => import("@/views/system/versions/VersionsOverview.vue"),
          meta: { title: "Versionen", tab: true, icon: "pi pi-check-circle" },
        },
      ],
    },

    {
      path: "/:pathMatch(.*)*",
      name: ROUTE.NOTFOUND,
      component: () => import("@/views/NotFound.vue"),
      meta: { requiresAuth: false, title: "Seite nicht gefunden" },
    },
  ],
});
router.beforeResolve(async (to) => {
  const auth = useAuthStore();
  const network = useNetworkStore();

  // 🔁 Auth einmal initialisieren
  if (!auth.isReady) {
    await auth.bootstrap();
  }

  // 🔌 OFFLINE: Dashboard immer erlauben
  if (!network.online && to.path.startsWith("/dashboard")) {
    return true;
  }

  // 🔐 AUTH erforderlich
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return {
      name: ROUTE.LOGIN,
      query: { redirect: to.fullPath },
    };
  }

  if (to.meta.localAuthOnly && !auth.localAuthEnabled) {
    return auth.isAuthenticated ? { name: ROUTE.PROFILE.LOGIN_CONNECTIONS } : { name: ROUTE.LOGIN };
  }

  const silentOidcAlreadyChecked =
    typeof to.query.oidc_silent === "string" || typeof to.query.oidc_error === "string";
  const explicitLogout = sessionStorage.getItem("loggedOut") === "true";

  if (
    to.name === ROUTE.LOGIN &&
    !auth.isAuthenticated &&
    auth.oidcEnabled &&
    !silentOidcAlreadyChecked &&
    !explicitLogout
  ) {
    const returnTo =
      typeof to.query.redirect === "string" && to.query.redirect.startsWith("/")
        ? to.query.redirect
        : "/dashboard";
    window.location.replace(
      `/api/auth/oidc/login?silent=true&returnTo=${encodeURIComponent(returnTo)}`,
    );
    return false;
  }

  // 👮 ADMIN erforderlich
  if (to.meta.requiresAdmin && !auth.isAdmin) {
    return { name: ROUTE.DASHBOARD };
  }

  // 🔄 Login-Seite blocken wenn bereits eingeloggt
  if (to.name === ROUTE.LOGIN && auth.isAuthenticated) {
    return { name: ROUTE.DASHBOARD };
  }

  return true;
});

router.afterEach((to) => {
  const baseTitle = "Bookmark Manager";

  const title = typeof to.meta.title === "function" ? to.meta.title(to) : to.meta.title;

  document.title = title ? `${title} · ${baseTitle}` : baseTitle;
});
