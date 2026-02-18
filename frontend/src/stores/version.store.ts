import { defineStore } from "pinia";
import { computed, type ComputedRef, nextTick, ref, type Ref, watch } from "vue";
import { useMutation, useSubscription } from "@vue/apollo-composable";
import {
  type AnySubscriptionVersion,
  type CustomColumnProps,
  type SubscriptionDeleteVersion,
  type Version,
} from "@/utils/interfaces.ts";
import gql from "graphql-tag";
import { useCommonStore } from "@/stores/common.store.ts";

import type { DataTableFilterMeta, DataTableSortMeta } from "primevue/datatable";
import { FilterMatchMode } from "@primevue/core/api";
import type { DataTableFilterEvent, DataTablePageEvent, DataTableSortEvent } from "primevue";
import { apolloClient } from "@/apollo/client.ts";
import type { RouteLocationRaw, RouteParamValue } from "vue-router";
import { devLog, mapDates } from "@/utils/utils.ts";
import {
  MUTATIONEN_CREATE_VERSION,
  MUTATIONEN_DELETE_VERSION,
  MUTATIONEN_UPDATE_VERSION,
  QUERY_VERSION,
  QUERY_VERSIONS,
  QUERY_VERSIONS_PAGED,
  SUBSCRIPTION_VERSION_CREATED,
  SUBSCRIPTION_VERSION_DELETED,
  SUBSCRIPTION_VERSION_UPDATED,
} from "@/utils/graphql/graphql.version.ts";
import { ROUTE } from "@/utils/router.names.ts";

export const useVersionStore = defineStore("versionStore", () => {
  const item: Ref<Version> = ref<Version>({
    id: "",
    versionNumber: "",
    description: "",
    createdAt: new Date(),
    updatedAt: null,
  });
  const pagedItems: Ref<Version[]> = ref<Version[]>([]);
  const allItems: Ref<Version[]> = ref<Version[]>([]);
  const totalCount: Ref<number> = ref(0);

  const lastVersion: ComputedRef<Version | undefined> = computed(() => {
    if (allItems.value && allItems.value.length > 0) {
      // devLog('lastVersion', allItems.value[0])
      return allItems.value[0];
    }
    return {
      id: "",
      versionNumber: "v.2.0.10",
      description: "",
      createdAt: new Date(),
      updatedAt: null,
    };
  });

  // Spalten für die Sortierung
  const multiSortMeta: Ref<DataTableSortMeta[]> = ref([{ field: "versionNumber", order: -1 }]);

  const filters: Ref<DataTableFilterMeta> = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    id: { value: null, matchMode: FilterMatchMode.CONTAINS },
    versionNumber: { value: null, matchMode: FilterMatchMode.CONTAINS },
    description: { value: null, matchMode: FilterMatchMode.CONTAINS },
    comment: { value: null, matchMode: FilterMatchMode.CONTAINS },
    createdAt: { value: null, matchMode: FilterMatchMode.DATE_IS },
    updatedAt: { value: null, matchMode: FilterMatchMode.DATE_IS },
  });

  /**
   * Spalten für die Tabelle
   */
  const columns: Ref<CustomColumnProps[]> = ref([
    {
      columnKey: "version-id",
      field: "id",
      header: "#",
      defaultShowing: false,
      dataType: "text",
      sortable: true,
    },
    {
      columnKey: "version-versionNumber",
      field: "versionNumber",
      header: "Versionsnummer",
      defaultShowing: true,
      dataType: "text",
      sortable: true,
    },
    {
      columnKey: "version-description",
      field: "description",
      header: "Beschreibung",
      defaultShowing: true,
      dataType: "text",
      sortable: true,
    },
    {
      columnKey: "version-comment",
      field: "comment",
      header: "Kommentar",
      defaultShowing: false,
      dataType: "text",
      sortable: true,
    },
    {
      columnKey: "version-createdAt",
      field: "createdAt",
      header: "erstellt am",
      dataType: "date",
      defaultShowing: false,
      sortable: true,
    },
    {
      columnKey: "version-updatedAt",
      field: "updatedAt",
      header: "letzte bearbeitung",
      dataType: "date",
      defaultShowing: false,
      sortable: true,
    },
  ]);

  // Definieren der Filter
  const defaultFilters = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    id: { value: null, matchMode: FilterMatchMode.CONTAINS },
    versionNumber: { value: null, matchMode: FilterMatchMode.CONTAINS },
    description: { value: null, matchMode: FilterMatchMode.CONTAINS },
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
        query: QUERY_VERSIONS_PAGED,
        variables: { page: event },
        fetchPolicy: "no-cache",
      });

      pagedItems.value = data.versionsPaged.items.map(mapDates);
      totalCount.value = data.versionsPaged.totalRecords;
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
          query: QUERY_VERSION,
          variables: { versionId: id },
          fetchPolicy: "network-only",
        })
        .finally(() => common.stopLoading());
      item.value.id = data.version.id;
      item.value.versionNumber = data.version.versionNumber;
      item.value.description = data.version.description;
      item.value.createdAt = new Date(data.version!.createdAt);
      item.value.updatedAt = data.version.updatedAt ? new Date(data.version.updatedAt) : undefined;
    } catch (err) {
      devLog("fetchOnlyItem userStore: ", err);
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
          query: QUERY_VERSIONS,
        })
        .finally(() => common.stopLoading());
      allItems.value = data.versions.map(mapDates);
    } catch (err) {
      devLog("fetchAllItems versionStore: ", err);
      common.error = err;
    } finally {
      common.stopLoading();
    }
  };

  // 2️⃣ Subscriptions für Live-Updates
  // : SubscriptionHandler<General>[]
  const subscriptions: AnySubscriptionVersion[] = [
    {
      query: SUBSCRIPTION_VERSION_CREATED,
      handler: (msg: Version) => {
        devLog("SUBSCRIPTION_MESSAGE_CREATED", msg);
        if (!pagedItems.value.find((a) => a.id === msg.id)) {
          pagedItems.value = [msg, ...pagedItems.value]; // <-- erzeugt neues Array
          allItems.value = [msg, ...allItems.value]; // <-- erzeugt neues Array
          totalCount.value++;
        }
      },
    },
    {
      query: SUBSCRIPTION_VERSION_UPDATED,
      handler: (msg: Version) => {
        devLog("SUBSCRIPTION_MESSAGE_UPDATED", msg);
        pagedItems.value = pagedItems.value.map((a) => (a.id === msg.id ? msg : a));
        allItems.value = allItems.value.map((a) => (a.id === msg.id ? msg : a));
      },
    },
    {
      query: SUBSCRIPTION_VERSION_DELETED,
      handler: async (msg: SubscriptionDeleteVersion) => {
        // 🔥 immer Array erzwingen
        const deletedVersions = Array.isArray(msg.version) ? msg.version : [msg.version];
        const deletedIds = deletedVersions.map((u) => u.id);

        pagedItems.value = pagedItems.value.filter((a) => !deletedIds.includes(a.id));

        allItems.value = allItems.value.filter((a) => !deletedIds.includes(a.id));

        totalCount.value = msg.totalCount ?? pagedItems.value.length;

        if (pagedItems.value.length !== totalCount.value) {
          await onLazyLoad({
            first: pageSize.value * page.value,
            rows: pageSize.value,
          });
        }
      },
    },
  ];

  subscriptions.forEach(({ query, handler }) => {
    const { onResult } = useSubscription(query);

    onResult(({ data }) => {
      if (!data) return;

      // Name des Subscription-Felds herausfinden
      const key = Object.keys(data)[0] as keyof typeof data;

      // Exakter Typ wird automatisch zugewiesen
      const msg = data[key];

      handler(msg);
    });
  });
  // ✅ CREATE
  const { mutate: createMutateVersion, loading: creatingLoading } = useMutation(
    MUTATIONEN_CREATE_VERSION,
    {
      update(cache, { data }) {
        if (!data?.createVersion) return;
        cache.modify({
          fields: {
            versions(existing = []) {
              const newRef = cache.writeFragment({
                data: data.createVersion,
                fragment: gql`
                  fragment NewVersion on Version {
                    id
                    versionNumber
                    description
                    createdAt
                    updatedAt
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

  const createItem = async (input?: Partial<Version>) => {
    const vars: Partial<Version> = {
      versionNumber: input?.versionNumber ?? item.value.versionNumber,
      description: input?.description ?? item.value.description,
    };

    await createMutateVersion(vars);
  };

  // ✅ UPDATE
  const { mutate: updateMutateVersion, loading: updatingLoading } =
    useMutation(MUTATIONEN_UPDATE_VERSION);

  const updateItem = async (input?: Partial<Version>) => {
    const vars: Partial<Version> = {
      id: input?.id ?? item.value.id,
      versionNumber: input?.versionNumber ?? item.value.versionNumber,
      description: input?.description ?? item.value.description,
    };

    const result = await updateMutateVersion(vars);
    if (result?.data?.updateVersion) {
      pagedItems.value = pagedItems.value.map((g) =>
        g.id === result?.data.updateVersion.id ? result?.data.updateVersion : g,
      );
    }
  };

  // ✅ DELETE
  const { mutate: deleteMutateVersion, loading: deletingLoading } =
    useMutation(MUTATIONEN_DELETE_VERSION);

  const deleteItem = async (ids: (string | undefined)[]) => {
    const result = await deleteMutateVersion({ ids });

    if (result?.data?.deleteVersion?.deleted) {
      const resultItems: Version[] = result?.data?.deleteVersion.deleted;

      for (let i = 0; i < resultItems.length; i++) {
        pagedItems.value = pagedItems.value.filter(
          (a) => a.id !== result?.data?.deleteVersion.deleted[i].id,
        );

        pagedItems.value = [...pagedItems.value]; // neue Referenz, um Reaktivität zu erzwingen
      }

      totalCount.value = result?.data.deleteVersion?.totalCount; // ✅ direkt aus Mutation
    }
  };

  // 📡 Bindung: loading/error direkt verknüpfen (reaktiv!)
  const isBusy = computed(
    () => creatingLoading.value || updatingLoading.value || deletingLoading.value,

    // || updatingPasswordLoading.value
  );

  watch([isBusy], () => {
    // common.isLoading = isBusy.value
  });

  /**
   * Route zum neuen Eintrag
   */
  const routeToNewItem = (): RouteLocationRaw => {
    return { name: ROUTE.SYSTEM.VERSIONS };
  };

  /**
   * Route zum Bearbeiten
   * @param item
   */
  const routeToEditItem = (item: Version): RouteLocationRaw => {
    return { name: ROUTE.SYSTEM.VERSIONS, params: { id: item.id } };
  };

  /**
   * Route zum Löschen
   * @param item
   */
  const routeToDeleteItem = (item: Version): RouteLocationRaw => ({
    name: ROUTE.SYSTEM.VERSIONS,
    params: { id: item.id },
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
    lastVersion,
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
    routeToNewItem,
    routeToEditItem,
    routeToDeleteItem,
  };
});
