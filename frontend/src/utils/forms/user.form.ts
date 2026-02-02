import type { FormField } from "@/utils/forms/types.ts";
import type { User } from "@/utils/interfaces.ts";
import { metaFormFields } from "@/utils/forms/meta.form.ts";

export const userFormFields: FormField<User>[] = [
  ...metaFormFields,
  {
    name: "role",
    label: "Role",
    type: "select",
    class: "col-span-12 md:col-span-6 xl:col-span-4",
    required: () => true,
    options: [
      { label: "User", value: "USER" },
      { label: "Admin", value: "ADMIN" },
    ],
  },
  {
    name: "email",
    label: "E-Mail Adresse",
    type: "text",
    required: () => true,
    class: "col-span-12 md:col-span-6 xl:col-span-4",
  },
  {
    name: "lastName",
    label: "Nachname",
    type: "text",
    required: () => true,
    class: "col-span-12 md:col-span-6 xl:col-span-4",
  },
  {
    name: "firstName",
    label: "Vorname",
    type: "text",
    required: () => true,
    class: "col-span-12 md:col-span-6 xl:col-span-4",
  },
  {
    name: "displayName",
    label: "Anzeigename",
    type: "text",
    required: () => true,
    class: "col-span-12 md:col-span-6 xl:col-span-4",
  },
  {
    name: "password",
    label: "Password",
    type: "password",
    required: () => true,
    class: "col-span-12 md:col-span-6 xl:col-span-4",
  },
];
