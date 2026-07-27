import type { FormField } from "@/utils/forms/types.ts";

export type OidcUnlinkFormModel = {
  passwordLoginEnabled: boolean;
  currentPassword: string;
  newPassword: string;
  newPasswordReplay: string;
};

export const userProfileOidcUnlinkFields: FormField<OidcUnlinkFormModel>[] = [
  {
    name: "currentPassword",
    label: "Aktuelles Passwort",
    type: "password",
    visible: (model) => model.passwordLoginEnabled,
    required: (model) => model.passwordLoginEnabled,
    class: "col-span-12",
    componentProps: {
      autocomplete: "current-password",
      feedback: false,
    },
  },
  {
    name: "newPassword",
    label: "Neues Passwort",
    type: "password",
    visible: (model) => !model.passwordLoginEnabled,
    required: (model) => !model.passwordLoginEnabled,
    class: "col-span-12",
    componentProps: {
      autocomplete: "new-password",
    },
  },
  {
    name: "newPasswordReplay",
    label: "Neues Passwort wiederholen",
    type: "password",
    visible: (model) => !model.passwordLoginEnabled,
    required: (model) => !model.passwordLoginEnabled,
    class: "col-span-12",
    componentProps: {
      autocomplete: "new-password",
      feedback: false,
    },
  },
];
