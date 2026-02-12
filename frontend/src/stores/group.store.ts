import { defineStore } from "pinia";
import { computed, nextTick, ref, type Ref, watch } from "vue";
import { useMutation } from "@vue/apollo-composable";
import {
  type CustomColumnProps,
  type Group,
  type Item,
  type SelectOption,
  type Tab,
  type User,
} from "@/utils/interfaces.ts";
import gql from "graphql-tag";
import { useCommonStore } from "@/stores/common.store.ts";

import { FilterMatchMode } from "@primevue/core/api";
import { apolloClient } from "@/apollo/client.ts";
import type { RouteLocationRaw, RouteParamValue } from "vue-router";
import { devLog, mapDates } from "@/utils/utils.ts";
import { ROUTE } from "@/utils/router.names.ts";
import {
  MUTATIONEN_CREATE_GROUP,
  MUTATIONEN_DELETE_GROUP,
  MUTATIONEN_UPDATE_GROUP,
  QUERY_GROUP,
  QUERY_GROUPS_PAGED,
  QUERY_ME_GROUPS,
  QUERY_ME_GROUPS_FOR_FILTER,
} from "@/utils/graphql/graphql.group.ts";
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
import { useTabStore } from "./tab.store";

export const useGroupStore = defineStore("groupStore", () => {
  const item: Ref<Group> = ref<Group>({
    id: "",
    title: "",
    order: 0,
    tabId: "",
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
    items: [] as Item[],
    createdAt: new Date(),
    updatedAt: null,
  });

  const allItems: Ref<Group[]> = ref<Group[]>([]);
  const allItemsForSelect: Ref<SelectOption[]> = ref<SelectOption[]>([]);

  const pagedItems: Ref<Group[]> = ref<Group[]>([]);
  const totalCount: Ref<number> = ref(0);

  const allGroups = ref<Group[]>([]);

  const selectedTabId = ref<string | null>(null);

  // Spalten für die Sortierung
  const multiSortMeta: Ref<DataTableSortMeta[]> = ref([
    { field: "order", order: -1 },
  ]);
  const filters: Ref<DataTableFilterMeta> = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    id: { value: null, matchMode: FilterMatchMode.CONTAINS },
    tabId: { value: [], matchMode: FilterMatchMode.IN },
    title: { value: null, matchMode: FilterMatchMode.CONTAINS },
    order: { value: null, matchMode: FilterMatchMode.EQUALS },
    createdAt: { value: null, matchMode: FilterMatchMode.DATE_IS },
    updatedAt: { value: null, matchMode: FilterMatchMode.DATE_IS },
  });
  /**
   * Spalten für die Groupelle
   */
  const columns: Ref<CustomColumnProps[]> = ref([
    {
      columnKey: "group-id",
      field: "id",
      header: "#",
      defaultShowing: false,
      dataType: "text",
    },
    {
      columnKey: "group-tab",
      field: "tab.title",
      header: "Tab",
      defaultShowing: true,
      dataType: "multiselect",
      filterKey: "tabs",
      filterField: "tabId",
    },
    {
      columnKey: "group-title",
      field: "title",
      header: "Titel",
      defaultShowing: true,
      dataType: "text",
    },
    {
      columnKey: "group-order",
      field: "order",
      header: "Reihenfolge",
      defaultShowing: true,
      dataType: "numeric",
    },

    {
      columnKey: "group-createdAt",
      field: "createdAt",
      header: "erstellt am",
      dataType: "date",
      defaultShowing: false,
    },
    {
      columnKey: "group-updatedAt",
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
    tabId: { value: [], matchMode: FilterMatchMode.IN },
    title: { value: null, matchMode: FilterMatchMode.CONTAINS },
    order: { value: null, matchMode: FilterMatchMode.EQUALS },
    groups: { value: null, matchMode: FilterMatchMode.CONTAINS },
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
        query: QUERY_GROUPS_PAGED,
        variables: { page: event },
        fetchPolicy: "no-cache",
      });

      pagedItems.value = data.groupsPaged.items.map(mapDates);
      totalCount.value = data.groupsPaged.totalRecords;
    } finally {
      common.stopLoading();
    }
  };

  const fetchOnlyItem = async (id: string | RouteParamValue[]) => {
    try {
      common.startLoading();
      const { data } = await apolloClient
        .query({
          query: QUERY_GROUP,
          variables: { groupId: id },
          fetchPolicy: "network-only",
        })
        .finally(() => common.startLoading());
      item.value.id = data.group.id;
      item.value.title = data.group.title;
      item.value.order = data.group.order;
      item.value.tabId = data.group.tabId;
      item.value.tab = data.group.tab;
      item.value.items = data.group.items;
      item.value.createdAt = new Date(data.group!.createdAt);
      item.value.updatedAt = data.group.updatedAt
        ? new Date(data.group.updatedAt)
        : null;
    } catch (err) {
      devLog("fetchOnlyItem groupStore: ", err);
      common.error = err;
    } finally {
      common.stopLoading();
    }
  };

  const fetchAllItems = async () => {
    try {
      common.startLoading();
      const { data } = await apolloClient.query({
        query: QUERY_ME_GROUPS,
        fetchPolicy: "network-only",
      });
      common.stopLoading();

      allItems.value = data.meGroups.map(mapDates);
    } catch (err) {
      devLog("fetchAllItems groupStore: ", err);
      common.error = err;
    } finally {
      common.stopLoading();
    }
  };

  const fetchAllItemsForSelect = async () => {
    try {
      common.startLoading();
      const { data } = await apolloClient.query({
        query: QUERY_ME_GROUPS_FOR_FILTER,
        fetchPolicy: "network-only",
      });

      allItemsForSelect.value = data.groupsForFilter.map((group: Group) => ({
        label: group.title,
        value: group.id,
      }));
    } catch (err) {
      devLog("fetchAllItems groupStore: ", err);
      common.error = err;
    } finally {
      common.stopLoading();
    }
  };

  // ✅ CREATE
  const { mutate: createMutateGroup, loading: creatingLoading } = useMutation(
    MUTATIONEN_CREATE_GROUP,
    {
      update(cache, { data }) {
        if (!data?.createGroup) return;
        cache.modify({
          fields: {
            versions(existing = []) {
              const newRef = cache.writeFragment({
                data: data.createGroup,
                fragment: gql`
                  fragment NewGroup on Group {
                    id
                    title
                    order
                    tab {
                      title
                      id
                    }
                    tabId
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

  const createItem = async (input?: Partial<Group>) => {
    const toastStore = useToastStore();
    const tabStore = useTabStore();

    try {
      const vars: Partial<Group> = {
        title: input?.title ?? item.value.title,
        order: input?.order ?? item.value.order,
        tabId: input?.tabId ?? item.value.tabId,
      };

      await createMutateGroup(vars);

      // ✅ Erfolg
      toastStore.success({
        summary: "Gruppe erstellt",
        detail: `${vars.title} wurde erfolgreich angelegt`,
      });

      await onLazyLoad({ first: page.value, rows: pageSize.value });
      await tabStore.fetchAllItemsForSelect();
      await fetchAllItems();

      return true;
    } catch (err: any) {
      // ❌ Fehler
      toastStore.error({
        summary: "Fehler beim Speichern",
        detail: err?.message ?? "Unbekannter Fehler",
      });

      // optional: Fehler weiterwerfen
      // throw err
      return false;
    }
  };

  // ✅ UPDATE
  const { mutate: updateMutateGroup, loading: updatingLoading } = useMutation(
    MUTATIONEN_UPDATE_GROUP,
  );

  const updateItem = async (input?: Partial<Group>) => {
    const toastStore = useToastStore();
    const tabStore = useTabStore();

    try {
      const vars: Partial<Group> = {
        id: input?.id ?? item.value.id,
        title: input?.title ?? item.value.title,
        order: input?.order ?? item.value.order,
      };

      // 👇 erst NACH der Initialisierung
      if ("tabId" in item.value) {
        vars.tabId = input?.tabId ?? item.value.tabId;
      }

      const result = await updateMutateGroup(vars);
      if (result?.data?.updateGroup) {
        pagedItems.value = pagedItems.value.map((m) =>
          m.id === result?.data.updateGroup.id ? result?.data.updateGroup : m,
        );
      }

      // ✅ Erfolg
      toastStore.success({
        summary: "Gruppe aktualisiert",
        detail: `${vars.title} wurde gespeichert`,
      });
      await onLazyLoad({ first: page.value, rows: pageSize.value });
      await tabStore.fetchAllItemsForSelect();
      return true;
    } catch (err: any) {
      // ❌ Fehler
      toastStore.error({
        summary: "Fehler beim Speichern",
        detail: err?.message ?? "Unbekannter Fehler",
      });

      // optional: Fehler weiterwerfen
      // throw err

      return false;
    }
  };

  // ✅ DELETE
  const { mutate: deleteMutateGroup, loading: deletingLoading } = useMutation(
    MUTATIONEN_DELETE_GROUP,
  );

  const deleteItem = async (ids: (string | undefined)[]) => {
    const result = await deleteMutateGroup({ ids });
    const toastStore = useToastStore();
    const tabStore = useTabStore();

    try {
      if (result?.data?.deleteGroup?.deleted) {
        const resultItems: Group[] = result?.data?.deleteGroup.deleted;

        for (let i = 0; i < resultItems.length; i++) {
          pagedItems.value = pagedItems.value.filter(
            (a) => a.id !== result?.data?.deleteGroup.deleted[i].id,
          );

          pagedItems.value = [...pagedItems.value]; // neue Referenz, um Reaktivität zu erzwingen

          // ✅ Erfolg
          toastStore.success({
            summary: "Group gelöscht",
            detail: `${result?.data?.deleteGroup.deleted[i].title} wurde gelöscht`,
          });

          totalCount.value = result?.data.deleteGroup?.totalCount; // ✅ direkt aus Mutation
          await onLazyLoad({ first: page.value, rows: pageSize.value });
          await fetchAllItems();
          await tabStore.fetchAllItems();
        }
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

  watch([isBusy], () => {
    // common.startLoading()
  });

  /**
   * Route zum neuen Eintrag
   */
  const routeToNewItem = (): RouteLocationRaw => {
    return { name: ROUTE.CONTENT.GROUPS_NEW };
  };

  /**
   * Route zum Bearbeiten
   * @param item
   */
  const routeToEditItem = (item: Group): RouteLocationRaw => {
    return { name: ROUTE.CONTENT.GROUPS_EDIT, params: { id: item.id } };
  };

  /**
   * Route zum Löschen
   * @param item
   */
  const routeToDeleteItem = (item: Group): RouteLocationRaw => ({
    name: ROUTE.CONTENT.GROUPS_DELETE,
    params: { id: item.id },
  });

  const upsertGroup = (group: Group) => {
    const idx = pagedItems.value.findIndex((g) => g.id === group.id);

    if (idx === -1) {
      pagedItems.value.push(group);
    } else {
      pagedItems.value[idx] = group;
    }
  };

  const removeGroup = (groupId: string) => {
    pagedItems.value = pagedItems.value.filter((g) => g.id !== groupId);
  };

  const groupsForSelectedTab = computed(() => {
    if (!selectedTabId.value) {
      return allGroups.value;
    }

    return allGroups.value.filter(
      (group) => group.tabId === selectedTabId.value,
    );
  });

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
    fetchAllItemsForSelect,
    routeToNewItem,
    routeToEditItem,
    routeToDeleteItem,
    upsertGroup,
    removeGroup,
    allItemsForSelect,
    groupsForSelectedTab,
    allGroups,
  };
});
