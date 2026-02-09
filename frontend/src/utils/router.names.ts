// router.names.ts
export const ROUTE = {
  HOME: "home",
  DASHBOARD: "dashboard",
  LOGIN: "login",
  RESET_PASSWORD: "reset-password",
  REGISTER: "registration",
  VERIFY: "verify",
  NOTFOUND: "notfound",

  PROFILE: "profile",

  CONTENT: {
    ROOT: "content",

    TABS: "content.tabs",
    TABS_NEW: "content.tabs.new",
    TABS_EDIT: "content.tabs.edit",
    TABS_DELETE: "content.tabs.delete",

    GROUPS: "content.groups",
    GROUPS_NEW: "content.groups.new",
    GROUPS_EDIT: "content.groups.edit",
    GROUPS_DELETE: "content.groups.delete",

    ITEMS: "content.items",
    ITEMS_NEW: "content.items.new",
    ITEMS_EDIT: "content.items.edit",
    ITEMS_DELETE: "content.items.delete",
  },

  SYSTEM: {
    ROOT: "system",

    USERS: "system.users",
    USERS_NEW: "system.users.new",
    USERS_EDIT: "system.users.edit",
    USERS_DELETE: "system.users.delete",

    TAGS: "system.tags",
    TAGS_NEW: "system.tags.new",
    TAGS_EDIT: "system.tags.edit",
    TAGS_DELETE: "system.tags.delete",

    VERSIONS: "system.versions",
  },
} as const;
