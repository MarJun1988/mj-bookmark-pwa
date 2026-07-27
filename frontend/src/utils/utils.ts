import type { Group, Item, Tab, Tag, User, Version } from "@/utils/interfaces.ts";

/**
 * Ausgabe von Meldungen nur im DEV Mode
 */
export const devLog = (...args: any[]) => {
  if (import.meta.env.DEV) {
    console.log(...args);
  }
};

export const mapDates = (item: User | Group | Item | Tab | Tag | Version) => {
  return {
    ...item,
    createdAt: item.createdAt
      ? new Date(item.createdAt).toLocaleTimeString("de-DE", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : null,
    updatedAt: item.updatedAt
      ? new Date(item.updatedAt).toLocaleTimeString("de-DE", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : null,
  };
};

export function requireOnline() {
  if (!navigator.onLine) {
    throw new Error("OFFLINE_MODE");
  }
}
