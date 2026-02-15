import { defineStore } from "pinia";
import { computed, nextTick, ref, type Ref, watch } from "vue";
import { useMutation, useSubscription } from "@vue/apollo-composable";
import {
  type AnySubscriptionUser,
  type CustomColumnProps,
  Role,
  type SubscriptionDeleteUser,
  type User,
  type UserPassword,
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
  MUTATIONEN_CREATE_USER,
  MUTATIONEN_DELETE_USER,
  MUTATIONEN_UPDATE_USER,
  MUTATIONEN_UPDATE_USER_PASSWORD,
  QUERY_USER,
  QUERY_USERS,
  QUERY_USERS_PAGED,
  SUBSCRIPTION_USER_CREATED,
  SUBSCRIPTION_USER_DELETED,
  SUBSCRIPTION_USER_UPDATED,
} from "@/utils/graphql/graphql.user.ts";
import { ROUTE } from "@/utils/router.names.ts";
import { useToastStore } from "@/stores/toast.store.ts";
import { useAuthStore } from "@/stores/auth.store.ts";
import { router } from "@/router";

export const useUserStore = defineStore("userStore", () => {
  const item: Ref<User> = ref<User>({
    id: "",
    email: "",
    firstName: "",
    lastName: "",
    displayName: "",
    password: "",
    role: Role.USER,
    createdAt: new Date(),
    updatedAt: null,
  });
  const pagedItems: Ref<User[]> = ref<User[]>([]);
  const allItems: Ref<User[]> = ref<User[]>([]);
  const totalCount: Ref<number> = ref(0);
  // Spalten für die Sortierung
  const multiSortMeta: Ref<DataTableSortMeta[]> = ref([
    { field: "lastName", order: 1 },
    { field: "firstName", order: 1 },
  ]);

  const filters: Ref<DataTableFilterMeta> = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    email: { value: null, matchMode: FilterMatchMode.CONTAINS },
    firstName: { value: null, matchMode: FilterMatchMode.CONTAINS },
    lastName: { value: null, matchMode: FilterMatchMode.CONTAINS },
    displayName: { value: null, matchMode: FilterMatchMode.CONTAINS },
    role: { value: [], matchMode: FilterMatchMode.IN },
    createdAt: { value: null, matchMode: FilterMatchMode.DATE_IS },
    updatedAt: { value: null, matchMode: FilterMatchMode.DATE_IS },
  });

  /**
   * Spalten für die Tabelle
   */
  const columns: Ref<CustomColumnProps[]> = ref([
    {
      columnKey: "user-id",
      field: "id",
      header: "#",
      defaultShowing: false,
      dataType: "text",
    },
    {
      columnKey: "user-email",
      field: "email",
      header: "E-Mail Address",
      defaultShowing: true,
      dataType: "text",
    },
    {
      columnKey: "user-last-name",
      field: "lastName",
      header: "Nachname",
      defaultShowing: true,
      dataType: "text",
    },
    {
      columnKey: "user-first-name",
      field: "firstName",
      header: "Vorname",
      defaultShowing: true,
      dataType: "text",
    },
    {
      columnKey: "user-display-name",
      field: "displayName",
      header: "Anzeigename",
      defaultShowing: false,
      dataType: "text",
    },
    {
      columnKey: "user-role",
      field: "role",
      header: "Rolle",
      defaultShowing: true,
      dataType: "text",
    },
    {
      columnKey: "user-createdAt",
      field: "createdAt",
      header: "erstellt am",
      dataType: "date",
      defaultShowing: false,
    },
    {
      columnKey: "user-updatedAt",
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
    email: { value: null, matchMode: FilterMatchMode.CONTAINS },
    firstName: { value: null, matchMode: FilterMatchMode.CONTAINS },
    lastName: { value: null, matchMode: FilterMatchMode.CONTAINS },
    displayName: { value: null, matchMode: FilterMatchMode.CONTAINS },
    role: { value: [], matchMode: FilterMatchMode.IN },
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
        query: QUERY_USERS_PAGED,
        variables: { page: event },
        fetchPolicy: "no-cache",
      });

      pagedItems.value = data.usersPaged.items.map(mapDates);
      totalCount.value = data.usersPaged.totalRecords;
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
          query: QUERY_USER,
          variables: { userId: id },
          fetchPolicy: "network-only",
        })
        .finally(() => common.stopLoading());
      item.value.id = data.user.id;
      item.value.email = data.user.email;
      item.value.firstName = data.user.firstName;
      item.value.lastName = data.user.lastName;
      item.value.displayName = data.user.displayName;
      item.value.role = data.user.role;
      item.value.createdAt = new Date(data.user!.createdAt);
      item.value.updatedAt = data.user.updatedAt ? new Date(data.user.updatedAt) : undefined;
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
          query: QUERY_USERS,
        })
        .finally(() => common.stopLoading());
      allItems.value = data.users.map(mapDates);
    } catch (err) {
      devLog("fetchAllItems userStore: ", err);
      common.error = err;
    } finally {
      common.stopLoading();
    }
  };

  // 2️⃣ Subscriptions für Live-Updates
  // : SubscriptionHandler<General>[]
  const subscriptions: AnySubscriptionUser[] = [
    {
      query: SUBSCRIPTION_USER_CREATED,
      handler: (msg: User) => {
        devLog("SUBSCRIPTION_MESSAGE_CREATED", msg);
        if (!pagedItems.value.find((a) => a.id === msg.id)) {
          pagedItems.value = [msg, ...pagedItems.value]; // <-- erzeugt neues Array
          allItems.value = [msg, ...allItems.value]; // <-- erzeugt neues Array
          totalCount.value++;
        }
      },
    },
    {
      query: SUBSCRIPTION_USER_UPDATED,
      handler: (msg: User) => {
        devLog("SUBSCRIPTION_MESSAGE_UPDATED", msg);
        pagedItems.value = pagedItems.value.map((a) => (a.id === msg.id ? msg : a));
        allItems.value = allItems.value.map((a) => (a.id === msg.id ? msg : a));
      },
    },
    {
      query: SUBSCRIPTION_USER_DELETED,
      handler: async (msg: SubscriptionDeleteUser) => {
        // 🔥 immer Array erzwingen
        const deletedUsers = Array.isArray(msg.user) ? msg.user : [msg.user];
        const deletedIds = deletedUsers.map((u) => u.id);

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
  const { mutate: createMutateUser, loading: creatingLoading } = useMutation(
    MUTATIONEN_CREATE_USER,
    {
      update(cache, { data }) {
        if (!data?.createUser) return;
        cache.modify({
          fields: {
            users(existing = []) {
              const newRef = cache.writeFragment({
                data: data.createUser,
                fragment: gql`
                  fragment NewUser on User {
                    id
                    email
                    firstName
                    lastName
                    displayName
                    role
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

  const createItem = async (input?: Partial<User>) => {
    const toastStore = useToastStore();

    try {
      const vars: Partial<User> = {
        email: input?.email ?? item.value.email,
        firstName: input?.firstName ?? item.value.firstName,
        lastName: input?.lastName ?? item.value.lastName,
        displayName: input?.displayName ?? item.value.displayName,
        password: input?.password ?? item.value.password,
        role: input?.role ?? item.value.role,
      };

      await createMutateUser(vars);

      // ✅ Erfolg
      toastStore.success({
        summary: "Benutzer erstellt",
        detail: `${vars.email} wurde erfolgreich angelegt`,
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

  // ✅ UPDATE
  const { mutate: updateMutateUser, loading: updatingLoading } =
    useMutation(MUTATIONEN_UPDATE_USER);

  const updateItem = async (input?: Partial<User>) => {
    const toastStore = useToastStore();

    try {
      const vars: Partial<User> = {
        id: input?.id ?? item.value.id,
        email: input?.email ?? item.value.email,
        firstName: input?.firstName ?? item.value.firstName,
        lastName: input?.lastName ?? item.value.lastName,
        displayName: input?.displayName ?? item.value.displayName,
        role: input?.role ?? item.value.role,
      };

      const result = await updateMutateUser(vars);
      const authStore = useAuthStore();
      if (result?.data?.updateUser) {
        pagedItems.value = pagedItems.value.map((m) =>
          m.id === result?.data.updateUser.id ? result?.data.updateUser : m,
        );

        if (authStore.user!.id === result.data.updateUser.id) {
          authStore.user!.displayName = result.data.updateUser.displayName;
        }
      }

      // ✅ Erfolg
      toastStore.success({
        summary: "Benutzer aktualisiert",
        detail: `${vars.email} wurde gespeichert`,
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
    }
    return false;
  };

  const { mutate: updateMutateUserPassword, loading: updatingPasswordLoading } = useMutation(
    MUTATIONEN_UPDATE_USER_PASSWORD,
  );

  const updateItemPassword = async (input: UserPassword) => {
    const toastStore = useToastStore();

    try {
      const vars: UserPassword = {
        id: input?.id ?? item.value.id,
        oldPassword: input.oldPassword,
        newPassword: input.newPassword,
        newPasswordReplay: input.newPasswordReplay,
      };

      const result = await updateMutateUserPassword(vars);
      if (result?.data?.updateUser) {
        pagedItems.value = pagedItems.value.map((m) =>
          m.id === result?.data.updateUser.id ? result?.data.updateUser : m,
        );
      }
      const authStore = useAuthStore();

      // ✅ Erfolg
      toastStore.success({
        summary: "Benutzer aktualisiert",
        detail: `Passwort wurde gespeichert`,
      });

      await authStore.logout();
      await router.push("/login");
      toastStore.success({
        summary: "Passwort geändert.",
        detail: `Bitte neu anmelden.`,
      });
      return true;
    } catch (err: any) {
      // ❌ Fehler
      toastStore.error({
        summary: "Fehler beim Speichern",
        detail: err?.message ?? "Unbekannter Fehler",
      });

      // optional: Fehler weiterwerfen
      // throw err
    }
    return false;
  };

  // ✅ DELETE
  const { mutate: deleteMutateUser, loading: deletingLoading } =
    useMutation(MUTATIONEN_DELETE_USER);

  const deleteItem = async (ids: (string | undefined)[]) => {
    const result = await deleteMutateUser({ ids });
    const toastStore = useToastStore();

    try {
      if (result?.data?.deleteUser?.deleted) {
        const resultItems: User[] = result?.data?.deleteUser.deleted;

        for (let i = 0; i < resultItems.length; i++) {
          pagedItems.value = pagedItems.value.filter(
            (a) => a.id !== result?.data?.deleteUser.deleted[i].id,
          );

          pagedItems.value = [...pagedItems.value]; // neue Referenz, um Reaktivität zu erzwingen

          // ✅ Erfolg
          toastStore.success({
            summary: "Benutzer gelöscht",
            detail: `${result?.data?.deleteUser.deleted[i].email} wurde gelöscht`,
          });
        }

        totalCount.value = result?.data.deleteUser?.totalCount; // ✅ direkt aus Mutation
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
    () => creatingLoading.value || updatingLoading.value || deletingLoading.value,
  );

  watch([isBusy], () => {});

  /**
   * Route zum neuen Eintrag
   */
  const routeToNewItem = (): RouteLocationRaw => {
    return { name: ROUTE.SYSTEM.USERS_NEW };
  };

  /**
   * Route zum Bearbeiten
   * @param item
   */
  const routeToEditItem = (item: User): RouteLocationRaw => {
    return { name: ROUTE.SYSTEM.USERS_EDIT, params: { id: item.id } };
  };

  /**
   * Route zum Löschen
   * @param item
   */
  const routeToDeleteItem = (item: User): RouteLocationRaw => ({
    name: ROUTE.SYSTEM.USERS_DELETE,
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
    creatingLoading,
    updatingLoading,
    updatingPasswordLoading,
    deletingLoading,
    columns,
    defaultFilters,
    createItem,
    updateItem,
    updateItemPassword,
    deleteItem,
    onLazyLoad,
    fetchOnlyItem,
    fetchAllItems,
    routeToNewItem,
    routeToEditItem,
    routeToDeleteItem,
  };
});
