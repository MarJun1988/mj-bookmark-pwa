import type { FormField } from "@/utils/forms/types.ts";
import type { Item } from "@/utils/interfaces.ts";
import { useTabStore } from "@/stores/tab.store.ts";
import { useGroupStore } from "@/stores/group.store.ts";
import { storeToRefs } from "pinia";
import { useTagStore } from "@/stores/tag.store.ts";
import { metaFormFields } from "@/utils/forms/meta.form.ts";

const tabStore = useTabStore();
const { allItemsForSelect: tabs } = storeToRefs(tabStore);
const groupStore = useGroupStore();
const { allItems: groups } = storeToRefs(groupStore);
const tagStore = useTagStore();
const { allItemsForSelect: tags } = storeToRefs(tagStore);

export const itemFormFields: FormField<Item>[] = [
  ...metaFormFields,
  {
    name: "__tabId",
    label: "Tab",
    type: "select",
    class: "col-span-12 md:col-span-6 xl:col-span-4",
    required: () => true,
    options: () => tabs.value,
  },
  {
    name: "groupId",
    label: "Gruppe",
    type: "select",
    class: "col-span-12 md:col-span-6 xl:col-span-4",
    dependsOn: ["__tabId"],
    resetOnDependencyChange: true,
    required: () => true,
    options: (model) =>
      groups.value
        .filter((g) => g.tabId === model.__tabId)
        .map((g) => ({
          label: g.title ?? "",
          value: g.id ?? "",
        })),
    disabled: (model) => !model.__tabId,
    readonly: (model) => !model.__tabId,
  },
  {
    name: "type",
    label: "Typ",
    type: "select",
    required: () => true,
    options: [
      {
        label: "LINK",
        value: "LINK",
      },
    ],
    class: "col-span-12 md:col-span-6 xl:col-span-4",
  },
  {
    name: "order",
    label: "Reihenfolge",
    type: "number",
    required: () => false,
    class: "col-span-12 md:col-span-6 xl:col-span-4",
  },
  {
    name: "url",
    label: "URL",
    type: "url",
    required: () => true,
    class: "col-span-12 md:col-span-6 xl:col-span-4",
    onBlurAction: "previewLinkMeta",
    affects: {
      title: "title",
      favicon: "favicon",
    },
  },
  {
    name: "title",
    label: "Titel",
    type: "text",
    required: () => true,
    class: "col-span-12 md:col-span-6 xl:col-span-4",
  },
  {
    name: "tagIds",
    label: "Tags",
    type: "multiselect",
    class: "col-span-12 md:col-span-6 xl:col-span-4",
    options: () => tags.value,
  },
];
