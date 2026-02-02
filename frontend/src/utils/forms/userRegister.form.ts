import type { FormField } from "@/utils/forms/types.ts";
import type { User } from "@/utils/interfaces.ts";

export const userRegisterFormFields: FormField<User>[] = [
  {
    name: "email",
    label: "E-Mail Adresse",
    type: "text",
    required: () => true,
    class: "col-span-12 md:col-span-12",
  },
  {
    name: "lastName",
    label: "Nachname",
    type: "text",
    required: () => true,
    class: "col-span-12 md:col-span-6",
  },
  {
    name: "firstName",
    label: "Vorname",
    type: "text",
    required: () => true,
    class: "col-span-12 md:col-span-6",
  },
  // {
  //   name: "displayName",
  //   label: "Anzeigename",
  //   type: "text",
  //   required: () => true,
  //   class: "col-span-12 md:col-span-6",
  // },
  {
    name: "password",
    label: "Password",
    type: "password",
    required: () => true,
    class: "col-span-12 md:col-span-6",
  },
  {
    name: "passwordReplay",
    label: "Password wiederholung",
    type: "password",
    required: () => true,
    class: "col-span-12 md:col-span-6",
  },
];
