import { defineStore } from "pinia";
import type { ToastMessageOptions } from "primevue/toast";

/* ----------------------------------------
 * Types
 * -------------------------------------- */

type ToastSeverity = NonNullable<ToastMessageOptions["severity"]>;

export interface ToastPayload {
  summary: string;
  detail?: string;
  life?: number;
  group?: string;
}

/* ----------------------------------------
 * Store
 * -------------------------------------- */

export const useToastStore = defineStore("toast", {
  /* ---------- STATE ---------- */
  state: () => ({
    toast: null as null | {
      add: (_options: ToastMessageOptions) => void;
      removeAllGroups: () => void;
      removeGroup: (_groupName: string) => void;
    },
    defaultLife: {
      success: 3000,
      info: 3000,
      warn: 4000,
      error: 5000,
      secondary: 3000,
      contrast: 3000,
    } as Record<ToastSeverity, number>,

    defaultGroup: undefined as string | undefined,
  }),

  /* ---------- GETTERS ---------- */
  getters: {
    lifeBySeverity:
      (state) =>
      (severity: ToastSeverity): number =>
        state.defaultLife[severity] ?? 3000,

    hasGroup:
      (state) =>
      (group?: string): boolean =>
        Boolean(group ?? state.defaultGroup),
  },

  /* ---------- ACTIONS ---------- */
  actions: {
    /** 🔥 Wird EINMAL aus App.vue gesetzt */
    register(toastInstance: any) {
      this.toast = toastInstance;
    },
    show(severity: ToastSeverity, payload: ToastPayload) {
      if (!this.toast) return; // optional: fallback/log

      this.toast.add({
        severity,
        summary: payload.summary,
        detail: payload.detail,
        life: payload.life ?? this.lifeBySeverity(severity),
        group: payload.group ?? this.defaultGroup,
      });
    },

    success(payload: ToastPayload) {
      this.show("success", payload);
    },

    info(payload: ToastPayload) {
      this.show("info", payload);
    },

    warn(payload: ToastPayload) {
      this.show("warn", payload);
    },

    error(payload: ToastPayload) {
      this.show("error", payload);
    },

    clear(group?: string) {
      if (!this.toast) return; // optional: fallback/log

      if (group) {
        this.toast.removeGroup(group);
      } else {
        this.toast.removeAllGroups();
      }
    },

    itemSaved() {
      this.success({ summary: "Eintrag gespeichert" });
    },

    permissionDenied() {
      this.error({ summary: "Keine Berechtigung" });
    },
  },
});
