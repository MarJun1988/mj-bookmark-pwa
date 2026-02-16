import type { FormField, FormMode } from "@/utils/forms/types.ts";
import type { Tag } from "@/utils/interfaces.ts";
import { metaFormFields } from "@/utils/forms/meta.form.ts";

export const tagFormFields = (mode: FormMode): FormField<Tag>[] => [
  ...(mode === "edit" ? metaFormFields : []),
  {
    name: "name",
    label: "Name",
    type: "text",
    required: () => true,
    class: "col-span-12 md:col-span-6 xl:col-span-4",
  },
  {
    name: "slug",
    label: "Slug",
    type: "text",
    required: () => true,
    class: "col-span-12 md:col-span-6 xl:col-span-4",
  },
];
