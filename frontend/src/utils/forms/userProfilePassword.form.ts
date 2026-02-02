import type { FormField } from "@/utils/forms/types.ts";
import type { User } from "@/utils/interfaces.ts";

export const userProfilePasswordFields: FormField<User>[] = [
  {
    name: "oldPassword",
    label: "aktuelles Password",
    type: "password",
    required: () => true,
    class: "col-span-12 md:col-span-6 xl:col-span-4",
  },
  {
    name: "newPassword",
    label: "neues Password",
    type: "password",
    required: () => true,
    class: "col-span-12 md:col-span-6 xl:col-span-4",
  },
  {
    name: "newPasswordReplay",
    label: "wiederholung neues Password",
    type: "password",
    required: () => true,
    class: "col-span-12 md:col-span-6 xl:col-span-4",
  },
];
