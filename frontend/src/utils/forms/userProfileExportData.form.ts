import type { FormField } from "@/utils/forms/types.ts";
import type { User } from "@/utils/interfaces.ts";

export const userProfileExportDataFormFields: FormField<User>[] = [
  {
    name: "email",
    label: "E-Mail Adresse",
    type: "text",
    required: () => true,
    class: "col-span-12 md:col-span-6 xl:col-span-4",
  },
  {
    name: "password",
    label: "aktuelles Password",
    type: "password",
    required: () => true,
    class: "col-span-12 md:col-span-6 xl:col-span-4",
    componentProps: {
      feedback: false,
    },
  },
];
