import { defineStore } from "pinia";
import { computed, nextTick, ref, type Ref, watch } from "vue";
import { useMutation } from "@vue/apollo-composable";
import {
  type AutoCompleteTagOption,
  type CustomColumnProps,
  type SelectOption,
  type Tag,
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
  MUTATIONEN_CREATE_TAG,
  MUTATIONEN_DELETE_TAG,
  MUTATIONEN_UPDATE_TAG,
  QUERY_TAG,
  QUERY_TAGS,
  QUERY_TAGS_FOR_FILTER,
  QUERY_TAGS_PAGED,
  QUERY_TAGS_SEARCH,
} from "@/utils/graphql/graphql.tag.ts";
import { useToastStore } from "@/stores/toast.store.ts";

export const useTagStore = defineStore("tagStore", () => {
  const item: Ref<Tag> = ref<Tag>({
    id: "",
    name: "",
    slug: "",
    createdAt: new Date(),
    updatedAt: null,
  });

  const allItems: Ref<Tag[]> = ref<Tag[]>([]);
  const allItemsForSelect: Ref<SelectOption[]> = ref<SelectOption[]>([]);
  const autoCompleteItems: Ref<AutoCompleteTagOption[]> = ref<AutoCompleteTagOption[]>([]);

  const pagedItems: Ref<Tag[]> = ref<Tag[]>([]);
  const totalCount: Ref<number> = ref(0);

  // Spalten für die Sortierung
  const multiSortMeta: Ref<DataTableSortMeta[]> = ref([
    { field: "name", order: 1 },
  ]);

  const filters: Ref<DataTableFilterMeta> = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    id: { value: null, matchMode: FilterMatchMode.CONTAINS },
    name: { value: null, matchMode: FilterMatchMode.CONTAINS },
    slug: { value: null, matchMode: FilterMatchMode.CONTAINS },
    createdAt: { value: null, matchMode: FilterMatchMode.DATE_IS },
    updatedAt: { value: null, matchMode: FilterMatchMode.DATE_IS },
  });

  /**
   * Spalten für die Tabelle
   */
  const columns: Ref<CustomColumnProps[]> = ref([
    {
      columnKey: "tag-id",
      field: "id",
      header: "#",
      defaultShowing: false,
      dataType: "text",
    },
    {
      columnKey: "tag-name",
      field: "name",
      header: "Name",
      defaultShowing: true,
      dataType: "text",
    },
    {
      columnKey: "tag-slug",
      field: "slug",
      header: "Slug",
      defaultShowing: true,
      dataType: "text",
    },
    {
      columnKey: "tag-createdAt",
      field: "createdAt",
      header: "erstellt am",
      dataType: "date",
      defaultShowing: false,
    },
    {
      columnKey: "tag-updatedAt",
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
    name: { value: null, matchMode: FilterMatchMode.CONTAINS },
    slug: { value: null, matchMode: FilterMatchMode.CONTAINS },
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
        query: QUERY_TAGS_PAGED,
        variables: { page: event },
        fetchPolicy: "no-cache",
      });

      devLog("data", data);

      pagedItems.value = data.tagsPaged.tags.map(mapDates);
      totalCount.value = data.tagsPaged.totalRecords;
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
          query: QUERY_TAG,
          variables: { tagId: id },
          fetchPolicy: "network-only",
        })
        .finally(() => common.stopLoading());
      item.value.id = data.tag.id;
      item.value.name = data.tag.name;
      item.value.slug = data.tag.slug;
      item.value.createdAt = new Date(data.tag!.createdAt);
      item.value.updatedAt = data.tag.updatedAt
        ? new Date(data.tag.updatedAt)
        : null;
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
          query: QUERY_TAGS,
        })
        .finally(() => common.stopLoading());
      allItems.value = data.tags.map(mapDates);
    } catch (err) {
      devLog("fetchAllItems tagStore: ", err);
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
          query: QUERY_TAGS_FOR_FILTER,
          fetchPolicy: "network-only",
        })
        .finally(() => common.stopLoading());

      allItemsForSelect.value = data.tagsForFilter.map((tag: Tag) => ({
        label: tag.slug,
        value: tag.id,
      }));

      autoCompleteItems.value = data.tagsForFilter.map((tag: Tag) => ({
        name: tag.name,
        id: tag.id,
      }));
    } catch (err) {
      devLog("loadTagsForFilter tagStore: ", err);
      common.error = err;
    } finally {
      common.stopLoading();
    }
  };

  const searchLocal = (query: string) => {
    return autoCompleteItems.value.filter(t =>
      t.name.toLowerCase().includes(query.toLowerCase())
    );
  };

  const searchTags = async (query: string) => {
    await fetchAllItemsForSelect();

    const local = searchLocal(query);

    if (local.length >= 10 || query.length < 2) {
      return local.slice(0, 20);
    }

    const { data } = await apolloClient.query({
      query: QUERY_TAGS_SEARCH,
      variables: {
        query,
        limit: 20,
      },
      fetchPolicy: 'no-cache',
    });

    return data.tagsSearchAutocomplete.map((tag: Tag) => ({
      name: tag.slug,
      id: tag.id,
    }));
  };

  // ✅ CREATE
  const { mutate: createMutateTag, loading: creatingLoading } = useMutation(
    MUTATIONEN_CREATE_TAG,
    {
      update(cache, { data }) {
        if (!data?.createTag) return;
        cache.modify({
          fields: {
            versions(existing = []) {
              const newRef = cache.writeFragment({
                data: data.createTag,
                fragment: gql`
                  fragment NewTag on Tag {
                    id
                    name
                    slug
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

  const createItem = async (input?: Partial<Tag>) => {
    const toastStore = useToastStore();

    try {
      const vars: Partial<Tag> = {
        name: input?.name ?? item.value.name,
        slug: input?.slug ?? item.value.slug,
      };

      await createMutateTag(vars);

      // ✅ Erfolg
      toastStore.success({
        summary: "Tag erstellt",
        detail: `${vars.name} wurde erfolgreich angelegt`,
      });

      await onLazyLoad({ first: page.value, rows: pageSize.value });
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

  const createItemAutoComplete = async (input?: Partial<Tag>): Promise<Tag> => {
    const toastStore = useToastStore();

    try {
      const vars: Partial<Tag> = {
        name: input?.name ?? item.value.name,
        slug: input?.slug ?? item.value.slug,
      };

      const result = await createMutateTag(vars);
      const created = result?.data?.createTag;

      if (!created) {
        throw new Error("Tag wurde erstellt, aber nicht zurückgegeben");
      }

      toastStore.success({
        summary: "Tag erstellt",
        detail: `${created.name} wurde erfolgreich angelegt`,
      });

      // optional: Liste neu laden
      await onLazyLoad({ first: page.value, rows: pageSize.value });

      return created; // 🔥 DAS IST ENTSCHEIDEND
    } catch (err: any) {
      toastStore.error({
        summary: "Fehler beim Speichern",
        detail: err?.message ?? "Unbekannter Fehler",
      });
      throw err;
    }
  };


  // ✅ UPDATE
  const { mutate: updateMutateTag, loading: updatingLoading } = useMutation(
    MUTATIONEN_UPDATE_TAG,
  );

  const updateItem = async (input?: Partial<Tag>) => {
    const toastStore = useToastStore();

    try {
      const vars: Partial<Tag> = {
        id: input?.id ?? item.value.id,
        name: input?.name ?? item.value.name,
        slug: input?.slug ?? item.value.slug,
      };

      const result = await updateMutateTag(vars);
      if (result?.data?.updateTag) {
        pagedItems.value = pagedItems.value.map((m) =>
          m.id === result?.data.updateTag.id ? result?.data.updateTag : m,
        );
      }

      // ✅ Erfolg
      toastStore.success({
        summary: "Tag aktualisiert",
        detail: `${vars.name} wurde gespeichert`,
      });

      await onLazyLoad({ first: page.value, rows: pageSize.value });
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
  const { mutate: deleteMutateTag, loading: deletingLoading } = useMutation(
    MUTATIONEN_DELETE_TAG,
  );

  const deleteItem = async (ids: (string | undefined)[]) => {
    const result = await deleteMutateTag({ ids });
    const toastStore = useToastStore();

    try {
      if (result?.data?.deleteTag?.deleted) {
        const resultItems: Tag[] = result?.data?.deleteTag.deleted;

        for (let i = 0; i < resultItems.length; i++) {
          pagedItems.value = pagedItems.value.filter(
            (a) => a.id !== result?.data?.deleteTag.deleted[i].id,
          );

          pagedItems.value = [...pagedItems.value]; // neue Referenz, um Reaktivität zu erzwingen

          // ✅ Erfolg
          toastStore.success({
            summary: "Tag gelöscht",
            detail: `${result?.data?.deleteTag.deleted[i].name} wurde gelöscht`,
          });
        }

        totalCount.value = result?.data.deleteTag?.totalCount; // ✅ direkt aus Mutation
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
  );

  watch([isBusy], () => {
    // common.isLoading = isBusy.value
  });

  /**
   * Route zum neuen Eintrag
   */
  const routeToNewItem = (): RouteLocationRaw => {
    return { name: ROUTE.SYSTEM.TAGS_NEW };
  };

  /**
   * Route zum Bearbeiten
   * @param item
   */
  const routeToEditItem = (item: Tag): RouteLocationRaw => {
    return { name: ROUTE.SYSTEM.TAGS_EDIT, params: { id: item.id } };
  };

  /**
   * Route zum Löschen
   * @param item
   */
  const routeToDeleteItem = (item: Tag): RouteLocationRaw => ({
    name: ROUTE.SYSTEM.TAGS_DELETE,
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
    allItemsForSelect,
    totalCount,
    creatingLoading,
    updatingLoading,
    deletingLoading,
    columns,
    defaultFilters,
    createItem,
    createItemAutoComplete,
    updateItem,
    deleteItem,
    onLazyLoad,
    fetchOnlyItem,
    fetchAllItems,
    fetchAllItemsForSelect,
    searchTags,
    routeToNewItem,
    routeToEditItem,
    routeToDeleteItem,
  };
});
