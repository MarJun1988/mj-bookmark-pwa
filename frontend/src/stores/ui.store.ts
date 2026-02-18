import { defineStore } from "pinia";

export type FloatLabelVariant = "in" | "over" | "on";

export const useUiStore = defineStore("ui", {
  state: () => ({
    floatLabelVariant: "in" as FloatLabelVariant,
  }),

  actions: {
    setFloatLabelVariant(variant: FloatLabelVariant) {
      this.floatLabelVariant = variant;
    },
  },
});
