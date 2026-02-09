import { defineStore } from "pinia";
import { computed, nextTick, ref, type Ref, watch } from "vue";
import { useMutation } from "@vue/apollo-composable";
import {
  type CustomColumnProps,
  type Group,
  type Tab,
} from "@/utils/interfaces.ts";
import gql from "graphql-tag";
import { useCommonStore } from "@/stores/common.store.ts";

import type {
  DataTableFilterMeta,
  DataTableSortMeta,
} from "primevue/datatable";
import { FilterMatchMode } from "@primevue/core/api";
import type {
  DataTableFilterEvent,
  DataTablePageEvent,
  DataTableSortEvent,
} from "primevue";
import { apolloClient } from "@/apollo/client.ts";
import type { RouteLocationRaw, RouteParamValue } from "vue-router";
import { devLog, mapDates } from "@/utils/utils.ts";
import { ROUTE } from "@/utils/router.names.ts";
import {
  MUTATIONEN_CREATE_TAB,
  MUTATIONEN_DELETE_TAB,
  MUTATIONEN_UPDATE_TAB,
  QUERY_ME_TABS,
  QUERY_ME_TABS_FOR_FILTER,
  QUERY_TAB,
  QUERY_TABS_PAGED,
} from "@/utils/graphql/graphql.tab.ts";
import { useToastStore } from "@/stores/toast.store.ts";

export const useTabStore = defineStore("tabStore", () => {
  const item: Ref<Tab> = ref<Tab>({
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
      role: "USER",
      createdAt: null,
    },
    groups: [] as Group[],
    createdAt: new Date(),
    updatedAt: null,
  });

  const allItems: Ref<Tab[]> = ref<Tab[]>([]);
  const allItemsForSelect: Ref<{ label: string; value: any }[]> = ref<
    { label: string; value: any }[]
  >([]);

  const pagedItems: Ref<Tab[]> = ref<Tab[]>([]);
  const totalCount: Ref<number> = ref(0);

  // Spalten für die Sortierung
  const multiSortMeta: Ref<DataTableSortMeta[]> = ref([
    { field: "order", order: -1 },
  ]);

  const filters: Ref<DataTableFilterMeta> = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    id: { value: null, matchMode: FilterMatchMode.CONTAINS },
    title: { value: null, matchMode: FilterMatchMode.CONTAINS },
   order: { value: null, matchMode: FilterMatchMode.EQUALS },
    groups: { value: null, matchMode: FilterMatchMode.CONTAINS },
    createdAt: { value: null, matchMode: FilterMatchMode.DATE_IS },
    updatedAt: { value: null, matchMode: FilterMatchMode.DATE_IS },
  });

  /**
   * Spalten für die Tabelle
   */
  const columns: Ref<CustomColumnProps[]> = ref([
    {
      columnKey: "tab-id",
      field: "id",
      header: "#",
      defaultShowing: false,
      dataType: "text",
    },
    {
      columnKey: "tab-title",
      field: "title",
      header: "Titel",
      defaultShowing: true,
      dataType: "text",
    },
    {
      columnKey: "tab-order",
      field: "order",
      header: "Reihenfolge",
      defaultShowing: true,
      dataType: "numeric",
    },
    {
      columnKey: "tab-groups",
      field: "groups",
      header: "Gruppen",
      defaultShowing: false,
      dataType: "text",
    },
    {
      columnKey: "tab-createdAt",
      field: "createdAt",
      header: "erstellt am",
      dataType: "date",
      defaultShowing: false,
    },
    {
      columnKey: "tab-updatedAt",
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

    page.value = event.first;
    pageSize.value = event.rows;

    // 🔄 Vue ein Repaint geben, bevor die Query startet
    await nextTick();
    await new Promise((resolve) => setTimeout(resolve)); // micro delay (1 frame)

    try {
      const { data } = await apolloClient.query({
        query: QUERY_TABS_PAGED,
        variables: { page: event },
        fetchPolicy: "no-cache",
      });

      pagedItems.value = data.tabsPaged.items.map(mapDates);
      totalCount.value = data.tabsPaged.totalRecords;
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
          query: QUERY_TAB,
          variables: { tabId: id },
        })
        .finally(() => common.stopLoading());

      item.value.id = data.tab.id;
      item.value.title = data.tab.title;
      item.value.order = data.tab.order;
      item.value.groups = data.tab.groups;
      item.value.createdAt = new Date(data.tab!.createdAt);
      item.value.updatedAt = data.tab.updatedAt
        ? new Date(data.tab.updatedAt)
        : undefined;
    } catch (err) {
      devLog("fetchOnlyItem tabStore: ", err);
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
          query: QUERY_ME_TABS,
        })
        .finally(() => common.stopLoading());
      allItems.value = data.meTabs.map(mapDates);

      if (allItemsForSelect.value.length === 0) {
        allItemsForSelect.value = data.meTabs.map((tab: Tab) => ({
          label: tab.title,
          value: tab.id,
        }));
      }
    } catch (err) {
      devLog("fetchAllItems tabStore: ", err);
      common.error = err;
    } finally {
      common.stopLoading();
    }
  };

  const fetchAllItemsForSelect = async () => {
    try {
      common.startLoading();
      const { data } = await apolloClient
        .query({
          query: QUERY_ME_TABS_FOR_FILTER,
          fetchPolicy: "network-only",
        })
        .finally(() => common.stopLoading());

      allItemsForSelect.value = data.tabsForFilter.map((tab: Tab) => ({
        label: tab.title,
        value: tab.id,
      }));
    } catch (err) {
      devLog("loadTabsForFilter tagStore: ", err);
      common.error = err;
    } finally {
      common.stopLoading();
    }
  };

  // ✅ CREATE
  const { mutate: createMutateTab, loading: creatingLoading } = useMutation(
    MUTATIONEN_CREATE_TAB,
    {
      update(cache, { data }) {
        if (!data?.createTab) return;
        cache.modify({
          fields: {
            versions(existing = []) {
              const newRef = cache.writeFragment({
                data: data.createTab,
                fragment: gql`
                  fragment NewTab on Tab {
                    id
                    title
                    order
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

  const createItem = async (input?: Partial<Tab>) => {
    const toastStore = useToastStore();

    try {
      const vars: Partial<Tab> = {
        title: input?.title ?? item.value.title,
        order: input?.order ?? item.value.order,
      };

      await createMutateTab(vars);

      // ✅ Erfolg
      toastStore.success({
        summary: "Tab erstellt",
        detail: `${vars.title} wurde erfolgreich angelegt`,
      });
      await onLazyLoad({ first: page.value, rows: pageSize.value });
      await fetchAllItemsForSelect();

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
  const { mutate: updateMutateTab, loading: updatingLoading } = useMutation(
    MUTATIONEN_UPDATE_TAB,
  );

  const updateItem = async (input?: Partial<Tab>) => {
    const toastStore = useToastStore();

    try {
      const vars: Partial<Tab> = {
        id: input?.id ?? item.value.id,
        title: input?.title ?? item.value.title,
        order: input?.order ?? item.value.order,
      };

      const result = await updateMutateTab(vars);
      if (result?.data?.updateTab) {
        pagedItems.value = pagedItems.value.map((m) =>
          m.id === result?.data.updateTab.id ? result?.data.updateTab : m,
        );
      }

      // ✅ Erfolg
      toastStore.success({
        summary: "Tab aktualisiert",
        detail: `${vars.title} wurde gespeichert`,
      });
      await onLazyLoad({ first: page.value, rows: pageSize.value });
      await fetchAllItemsForSelect();

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
  const { mutate: deleteMutateTab, loading: deletingLoading } = useMutation(
    MUTATIONEN_DELETE_TAB,
  );

  const deleteItem = async (ids: (string | undefined)[]) => {
    const result = await deleteMutateTab({ ids });
    const toastStore = useToastStore();

    try {
      if (result?.data?.deleteTab?.deleted) {
        const resultItems: Tab[] = result?.data?.deleteTab.deleted;

        for (let i = 0; i < resultItems.length; i++) {
          pagedItems.value = pagedItems.value.filter(
            (a) => a.id !== result?.data?.deleteTab.deleted[i].id,
          );

          pagedItems.value = [...pagedItems.value]; // neue Referenz, um Reaktivität zu erzwingen

          // ✅ Erfolg
          toastStore.success({
            summary: "Tab gelöscht",
            detail: `${result?.data?.deleteTab.deleted[i].title} wurde gelöscht`,
          });
        }

        totalCount.value = result?.data.deleteTab?.totalCount; // ✅ direkt aus Mutation
        await onLazyLoad({ first: page.value, rows: pageSize.value });
        await fetchAllItemsForSelect();
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

  watch([isBusy], () => {});

  /**
   * Route zum neuen Eintrag
   */
  const routeToNewItem = (): RouteLocationRaw => {
    return { name: ROUTE.CONTENT.TABS_NEW };
  };

  /**
   * Route zum Bearbeiten
   * @param item
   */
  const routeToEditItem = (item: Tab): RouteLocationRaw => {
    return { name: ROUTE.CONTENT.TABS_EDIT, params: { id: item.id } };
  };

  /**
   * Route zum Löschen
   * @param item
   */
  const routeToDeleteItem = (item: Tab): RouteLocationRaw => ({
    name: ROUTE.CONTENT.TABS_DELETE,
    params: { id: item.id },
  });

  const upsertTab = (tab: Tab) => {
    const idx = pagedItems.value.findIndex((t) => t.id === tab.id);

    if (idx === -1) {
      pagedItems.value.push(tab);
    } else {
      pagedItems.value[idx] = tab;
    }
  };

  const removeTab = (tabId: string) => {
    pagedItems.value = pagedItems.value.filter((t) => t.id !== tabId);
  };

  //
  // const upsertTab = (tab: Tab) => {
  //     const idx = pagedItems.value.findIndex(t => t.id === tab.id)
  //     if (idx === -1) pagedItems.value.push(tab)
  //     else pagedItems.value[idx] = tab
  // }

  return {
    filters,
    page,
    pageSize,
    multiSortMeta,
    item,
    allItems,
    pagedItems,
    allItemsForSelect,
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
    upsertTab,
    removeTab,
  };
});
