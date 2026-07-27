import type { FormField, FormMode } from "@/utils/forms/types.ts";
import type { Tab } from "@/utils/interfaces.ts";
import { metaFormFields } from "@/utils/forms/meta.form.ts";

export const tabFormFields = (mode: FormMode): FormField<Tab>[] => [
  ...(mode === "edit" ? metaFormFields : []),
  {
    name: "order",
    label: "Reihenfolge",
    type: "number",
    required: () => false,
    class: "col-span-12 md:col-span-6 xl:col-span-4",
  },
  {
    name: "title",
    label: "Titel",
    type: "text",
    required: () => true,
    class: "col-span-12 md:col-span-6 xl:col-span-4",
  },
];
