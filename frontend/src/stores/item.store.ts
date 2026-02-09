import { defineStore } from "pinia";
import { computed, nextTick, ref, type Ref, watch } from "vue";
import { useMutation } from "@vue/apollo-composable";
import {
  type CustomColumnProps,
  type Group,
  type Item,
  type Tab,
  type Tag,
  type User,
} from "@/utils/interfaces.ts";
import gql from "graphql-tag";
import { useCommonStore } from "@/stores/common.store.ts";

import { FilterMatchMode } from "@primevue/core/api";
import { apolloClient } from "@/apollo/client.ts";
import type { RouteLocationRaw, RouteParamValue } from "vue-router";
import { devLog, mapDates, requireOnline } from "@/utils/utils.ts";
import { ROUTE } from "@/utils/router.names.ts";
import {
  MUTATIONEN_CREATE_ITEM,
  MUTATIONEN_DELETE_ITEM,
  MUTATIONEN_REFRESH_ALL_FAVICONS,
  MUTATIONEN_UPDATE_ITEM,
  QUERY_ITEM,
  QUERY_ITEMS_PAGED,
  QUERY_ME_ITEMS,
} from "@/utils/graphql/graphql.item.ts";
import { useToastStore } from "@/stores/toast.store.ts";
import type {
  DataTableFilterMeta,
  DataTableSortMeta,
} from "primevue/datatable";
import type {
  DataTableFilterEvent,
  DataTablePageEvent,
  DataTableSortEvent,
} from "primevue";

export const useItemStore = defineStore("itemStore", () => {
  const item: Ref<Item> = ref<Item>({
    id: "",
    type: "LINK",
    order: 0,
    title: "",
    groupId: "",
    group: {
      tab: {
        id: "",
        title: "",
        order: 0,
        userId: "",
        user: {
          id: "",
          lastName: "",
          firstName: "",
          displayName: "",
          email: "",
          password: "",
        } as User,
      } as Tab,
      order: 0,
      title: "",
      id: "",
      tabId: "",
    } as Group,
    url: "",
    favicon: "",
    config: {} as JSON,
    tags: [] as Tag[],
    createdAt: new Date(),
    updatedAt: null,
  });
  const pagedItems: Ref<Item[]> = ref<Item[]>([]);
  const allItems: Ref<Item[]> = ref<Item[]>([]);
  const totalCount: Ref<number> = ref(0);

  // Spalten für die Sortierung
  const multiSortMeta: Ref<DataTableSortMeta[]> = ref([
    { field: "group.tab.title", order: 1 },
    { field: "group.title", order: 1 },
    { field: "title", order: 1 },
  ]);

  const filters: Ref<DataTableFilterMeta> = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    id: { value: null, matchMode: FilterMatchMode.CONTAINS },
    "group.tab.id": { value: [], matchMode: FilterMatchMode.IN },
    groupId: { value: [], matchMode: FilterMatchMode.IN },
    title: { value: null, matchMode: FilterMatchMode.CONTAINS },
    order: { value: null, matchMode: FilterMatchMode.EQUALS },
    url: { value: null, matchMode: FilterMatchMode.CONTAINS },
    "tags.id": { value: [], matchMode: FilterMatchMode.IN },
    createdAt: { value: null, matchMode: FilterMatchMode.DATE_IS },
    updatedAt: { value: null, matchMode: FilterMatchMode.DATE_IS },
  });

  /**
   * Spalten für die Itemelle
   */
  const columns: Ref<CustomColumnProps[]> = ref([
    {
      columnKey: "item-id",
      field: "id",
      header: "#",
      defaultShowing: false,
      dataType: "text",
    },
    {
      columnKey: "item-tab",
      field: "group.tab.title",
      header: "Tab",
      defaultShowing: true,
      dataType: "multiselect",
      filterKey: "tabs",
      filterField: "group.tab.id",
    },
    {
      columnKey: "item-group",
      field: "group.title",
      header: "Gruppe",
      defaultShowing: true,
      dataType: "multiselect",
      filterKey: "groups",
      filterField: "groupId",
    },
    {
      columnKey: "item-title",
      field: "title",
      header: "Titel",
      defaultShowing: true,
      dataType: "text",
      withIcon: true,
      options: {
        icon: {
          field: "favicon",
          size: "sm",
        },
      },
    },
    {
      columnKey: "item-order",
      field: "order",
      header: "Reihenfolge",
      defaultShowing: false,
      dataType: "numeric",
    },
    {
      columnKey: "item-url",
      field: "url",
      header: "URL",
      defaultShowing: false,
      dataType: "text",
    },
    {
      columnKey: "item-tags",
      field: "tags.id",
      header: "Tags",
      defaultShowing: true,
      dataType: "multiselect",
      filterKey: "tags",
      filterField: "tags.id",
    },
    {
      columnKey: "item-createdAt",
      field: "createdAt",
      header: "erstellt am",
      dataType: "date",
      defaultShowing: false,
    },
    {
      columnKey: "item-updatedAt",
      field: "updatedAt",
      header: "letzte bearbeitung",
      dataType: "date",
      defaultShowing: false,
    },
  ]);

  // Definieren der Filter
  const defaultFilters = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    id: { value: null, matchMode: FilterMatchMode.CONTAINS },
    "group.tab.id": { value: [], matchMode: FilterMatchMode.IN },
    groupId: { value: [], matchMode: FilterMatchMode.IN },
    title: { value: null, matchMode: FilterMatchMode.CONTAINS },
    order: { value: null, matchMode: FilterMatchMode.EQUALS },
    url: { value: null, matchMode: FilterMatchMode.CONTAINS },
    "tags.id": { value: [], matchMode: FilterMatchMode.IN },
    createdAt: { value: null, matchMode: FilterMatchMode.DATE_IS },
    updatedAt: { value: null, matchMode: FilterMatchMode.DATE_IS },
  };

  // Pagination-Zustand
  const page: Ref<number> = ref(0);
  const pageSize: Ref<number> = ref(10);

  // ✅ Lokaler Common-Store nur einmal referenzieren
  const common = useCommonStore();

  const onLazyLoad = async (
    event:
      | DataTablePageEvent
      | DataTableSortEvent
      | DataTableFilterEvent
      | { first: number; rows: number },
  ): Promise<void> => {
    common.startLoading();

    // 🔄 Vue ein Repaint geben, bevor die Query startet
    await nextTick();
    await new Promise((resolve) => setTimeout(resolve)); // micro delay (1 frame)

    try {
      const { data } = await apolloClient.query({
        query: QUERY_ITEMS_PAGED,
        variables: { page: event },
        fetchPolicy: "no-cache",
      });

      pagedItems.value = data.itemsPaged.items.map(mapDates);
      totalCount.value = data.itemsPaged.totalRecords;
    } finally {
      common.stopLoading();
    }
    common.stopLoading();
  };

  const fetchOnlyItem = async (id: string | RouteParamValue[]) => {
    try {
      common.startLoading();
      const { data } = await apolloClient
        .query({
          query: QUERY_ITEM,
          variables: { itemId: id },
        })
        .finally(() => common.stopLoading());

      item.value.id = data.item.id;
      item.value.title = data.item.title;
      item.value.order = data.item.order;
      item.value.type = data.item.type;
      item.value.groupId = data.item.groupId;
      item.value.group = data.item.group;
      item.value.url = data.item.url;
      item.value.favicon = data.item.favicon;
      item.value.config = data.item.config;
      item.value.tags = data.item.tags;
      item.value.createdAt = new Date(data.item!.createdAt);
      item.value.updatedAt = data.item.updatedAt
        ? new Date(data.item.updatedAt)
        : undefined;
    } catch (err) {
      devLog("fetchOnlyItem itemStore: ", err);
      common.error = err;
    } finally {
      common.stopLoading();
    }
  };

  const fetchAllItems = async () => {
    try {
      common.startLoading();
      const { data } = await apolloClient
        .query({
          query: QUERY_ME_ITEMS,
        })
        .finally(() => common.stopLoading());
      allItems.value = data.items.map(mapDates);
    } catch (err) {
      devLog("fetchAllItems itemStore: ", err);
      common.error = err;
    } finally {
      common.stopLoading();
    }
  };

  const refreshFavicons = async () => {
    try {
      common.startLoading();
      await apolloClient
        .mutate({
          mutation: MUTATIONEN_REFRESH_ALL_FAVICONS,
        })
        .finally(() => common.stopLoading());
    } catch (err) {
      devLog("refreshFavicons itemStore: ", err);
      common.error = err;
    } finally {
      common.stopLoading();
    }
  };

  // ✅ CREATE
  const { mutate: createMutateItem, loading: creatingLoading } = useMutation(
    MUTATIONEN_CREATE_ITEM,
    {
      update(cache, { data }) {
        if (!data?.createItem) return;
        cache.modify({
          fields: {
            versions(existing = []) {
              const newRef = cache.writeFragment({
                data: data.createItem,
                fragment: gql`
                  fragment NewItem on Item {
                    id
                    type
                    title
                    order
                    groupId
                    group {
                      id
                      tabId
                      title
                    }
                    url
                    tags {
                      id
                      slug
                      name
                    }
                  }
                `,
              });
              return [newRef, ...existing];
            },
          },
        });
      },
    },
  );

  const createItem = async (input?: Partial<Item>) => {
    const toastStore = useToastStore();
    requireOnline();
    try {
      const vars: Partial<Item> = {
        groupId: input?.groupId ?? item.value.groupId,
        title: input?.title ?? item.value.title,
        order: input?.order ?? item.value.order,
        type: input?.type ?? item.value.type,
        url: input?.url ?? item.value.url,
        // tags: input?.tags ?? item.value.tags,
        tagIds: input?.tagIds ?? item.value.tagIds,
        // tagIds: input?.tagIds ?? item.value.tagIds,
        config: input?.config ?? item.value.config,
      };

      console.log("vars", vars);

      await createMutateItem({ input: vars });

      // ✅ Erfolg
      toastStore.success({
        summary: "Item erstellt",
        detail: `${vars.title} wurde erfolgreich angelegt`,
      });
      await onLazyLoad({ first: page.value, rows: pageSize.value });
      return true;
    } catch (err: any) {
      // ❌ Fehler
      toastStore.error({
        summary: "Fehler beim Speichern",
        detail: err?.message ?? "Unbekannter Fehler",
      });

      return false;

      // // optional: Fehler weiterwerfen
      // throw err
    }
  };

  // ✅ UPDATE
  const { mutate: updateMutateItem, loading: updatingLoading } = useMutation(
    MUTATIONEN_UPDATE_ITEM,
  );

  const updateItem = async (input?: Partial<Item>) => {
    const toastStore = useToastStore();
    requireOnline();

    try {
      const vars: Partial<Item> = {
        id: input?.id ?? item.value.id,
        type: input?.type ?? item.value.type,
        title: input?.title ?? item.value.title,
        order: input?.order ?? item.value.order,
        groupId: input?.groupId ?? item.value.groupId,
        url: input?.url ?? item.value.url,
        // tagIds: input?.tagIds ?? item.value.tagIds,
        tagIds: input?.tagIds ?? item.value.tagIds,
        // tags: input?.tags ?? item.value.tags,
      };
      // tags: input?.tags ?? item.value.tags,

      const result = await updateMutateItem({ id: vars.id, input: vars });
      if (result?.data?.updateItem) {
        pagedItems.value = pagedItems.value.map((m: Item) =>
          m.id === result?.data.updateItem.id ? result?.data.updateItem : m,
        );
      }

      // ✅ Erfolg
      toastStore.success({
        summary: "Item aktualisiert",
        detail: `${vars.title} wurde gespeichert`,
      });
      await onLazyLoad({ first: page.value, rows: pageSize.value });

      return true;
    } catch (err: any) {
      // ❌ Fehler
      toastStore.error({
        summary: "Fehler beim Speichern",
        detail: err?.message ?? "Unbekannter Fehler",
      });

      // // optional: Fehler weiterwerfen
      // throw err

      return false;
    }
  };

  // ✅ DELETE
  const { mutate: deleteMutateItem, loading: deletingLoading } = useMutation(
    MUTATIONEN_DELETE_ITEM,
  );

  const deleteItem = async (ids: (string | undefined)[]) => {
    const result = await deleteMutateItem({ ids });
    const toastStore = useToastStore();

    try {
      if (result?.data?.deleteItem?.deleted) {
        const resultItems: Item[] = result?.data?.deleteItem.deleted;

        for (let i = 0; i < resultItems.length; i++) {
          pagedItems.value = pagedItems.value.filter(
            (a) => a.id !== result?.data?.deleteItem.deleted[i].id,
          );

          pagedItems.value = [...pagedItems.value]; // neue Referenz, um Reaktivität zu erzwingen

          // ✅ Erfolg
          toastStore.success({
            summary: "Item gelöscht",
            detail: `${result?.data?.deleteItem.deleted[i].title} wurde gelöscht`,
          });
        }

        totalCount.value = result?.data.deleteItem?.totalCount; // ✅ direkt aus Mutation
        await onLazyLoad({ first: page.value, rows: pageSize.value });
      }
    } catch (err: any) {
      // ❌ Fehler
      toastStore.error({
        summary: "Fehler beim Speichern",
        detail: err?.message ?? "Unbekannter Fehler",
      });

      // optional: Fehler weiterwerfen
      throw err;
    }
  };

  // 📡 Bindung: loading/error direkt verknüpfen (reaktiv!)
  const isBusy = computed(
    () =>
      creatingLoading.value || updatingLoading.value || deletingLoading.value,

    // || updatingPasswordLoading.value
  );

  watch([isBusy], () => { });

  /**
   * Route zum neuen Eintrag
   */
  const routeToNewItem = (): RouteLocationRaw => {
    return { name: ROUTE.CONTENT.ITEMS_NEW };
  };

  /**
   * Route zum Bearbeiten
   * @param item
   */
  const routeToEditItem = (item: Item): RouteLocationRaw => {
    return { name: ROUTE.CONTENT.ITEMS_EDIT, params: { id: item.id } };
  };

  /**
   * Route zum Löschen
   * @param item
   */
  const routeToDeleteItem = (item: Item): RouteLocationRaw => ({
    name: ROUTE.CONTENT.ITEMS_DELETE,
    params: { id: item.id },
  });

  const upsertItem = (item: Item) => {
    const idx = pagedItems.value.findIndex((g) => g.id === item.id);

    if (idx === -1) {
      pagedItems.value.push(item);
    } else {
      pagedItems.value[idx] = item;
    }
  };

  const removeItem = (itemId: string) => {
    pagedItems.value = pagedItems.value.filter((g) => g.id !== itemId);
  };

  return {
    filters,
    page,
    pageSize,
    multiSortMeta,
    item,
    allItems,
    pagedItems,
    totalCount,
    creatingLoading,
    updatingLoading,
    deletingLoading,
    columns,
    defaultFilters,
    createItem,
    updateItem,
    deleteItem,
    onLazyLoad,
    fetchOnlyItem,
    fetchAllItems,
    refreshFavicons,
    routeToNewItem,
    routeToEditItem,
    routeToDeleteItem,
    upsertItem,
    removeItem,
  };
});
