import type { FormField } from "@/utils/forms/types.ts";
import type {
  Group,
  Item,
  Tab,
  Tag,
  User,
  Version,
} from "@/utils/interfaces.ts";

export const metaFormFields: FormField<
  | Partial<Version>
  | Partial<User>
  | Partial<Tag>
  | Partial<Tab>
  | Partial<Group>
  | Partial<Item>
>[] = [
  {
    name: "id",
    label: "#",
    type: "text",
    readonly: () => true,
    class: "col-span-12 md:col-span-6 xl:col-span-4",
  },
  {
    name: "createdAt",
    label: "erstellt am",
    type: "datetime",
    readonly: () => true,
    class: "col-span-12 md:col-span-6 xl:col-span-4",
  },
  {
    name: "updatedAt",
    label: "letzte Bearbeitung",
    type: "datetime",
    readonly: () => true,
    class: "col-span-12 md:col-span-6 xl:col-span-4",
  },
];
