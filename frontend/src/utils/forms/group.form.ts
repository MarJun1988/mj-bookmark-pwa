import type { FormField, FormMode } from "@/utils/forms/types.ts";
import type { Group } from "@/utils/interfaces.ts";
import { useTabStore } from "@/stores/tab.store.ts";
import { storeToRefs } from "pinia";
import { metaFormFields } from "@/utils/forms/meta.form.ts";

const tabStore = useTabStore();
const { allItemsForSelect: tabs } = storeToRefs(tabStore);

export const groupFormFields = (mode: FormMode): FormField<Group>[] => [
  ...(mode === 'edit' ? metaFormFields : []),
  {
    name: "order",
    label: "Reihenfolge",
    type: "number",
    required: () => false,
    class: "col-span-12 md:col-span-6 xl:col-span-4",
  },
  {
    name: "tabId",
    label: "Tab",
    type: "select",
    class: "col-span-12 md:col-span-6 xl:col-span-4",
    required: () => true,
    options: () => tabs.value,
  },
  {
    name: "title",
    label: "Titel",
    type: "text",
    required: () => true,
    class: "col-span-12 md:col-span-6 xl:col-span-4",
  },
];
