import { useTabStore } from "@/stores/tab.store.ts";
import { useDashboardStore } from "@/stores/dashboard.store.ts";
import { provideApolloClient, useSubscription } from "@vue/apollo-composable";
import {
  SUBSCRIPTION_TAB_CREATED,
  SUBSCRIPTION_TAB_DELETED,
  SUBSCRIPTION_TAB_UPDATED,
} from "@/utils/graphql/graphql.tab.ts";
import {
  SUBSCRIPTION_GROUP_CREATED,
  SUBSCRIPTION_GROUP_DELETED,
  SUBSCRIPTION_GROUP_UPDATED,
} from "@/utils/graphql/graphql.group.ts";
import { useGroupStore } from "@/stores/group.store.ts";
import { useItemStore } from "@/stores/item.store.ts";
import {
  SUBSCRIPTION_ITEM_CREATED,
  SUBSCRIPTION_ITEM_DELETED,
  SUBSCRIPTION_ITEM_UPDATED,
} from "@/utils/graphql/graphql.item.ts";
import { apolloClient } from "@/apollo/client.ts";
import { effectScope } from "vue";

let scope: ReturnType<typeof effectScope> | null = null;

export async function startGlobalSubscriptions() {
  if (scope) return; // 🛑 doppelt verhindern

  scope = effectScope();
  scope.run(() => {
    return provideApolloClient(apolloClient)(() => {
      // ⬇️ JETZT ist der Context da
      // const groupStore = useGroupStore()
      // Stores
      const dashboardStore = useDashboardStore();
      const tabStore = useTabStore();
      const groupStore = useGroupStore();
      const itemSore = useItemStore();

      // Tab Subscriptions
      const { onResult: onResultTabCreated } = useSubscription(SUBSCRIPTION_TAB_CREATED);
      const { onResult: onResultTabUpdated } = useSubscription(SUBSCRIPTION_TAB_UPDATED);
      const { onResult: onResultTabDeleted } = useSubscription(SUBSCRIPTION_TAB_DELETED);

      onResultTabCreated(({ data }) => {
        console.debug("startGlobalSubscriptions() - SUBSCRIPTION_TAB_CREATED", data);

        tabStore.upsertTab(data.tabCreated);
        dashboardStore.upsertTab(data.tabCreated);
      });
      onResultTabUpdated(({ data }) => {
        console.debug("startGlobalSubscriptions() - SUBSCRIPTION_TAB_UPDATED", data);

        tabStore.upsertTab(data.tabUpdated);
        dashboardStore.upsertTab(data.tabUpdated);
      });
      onResultTabDeleted(({ data }) => {
        console.debug("startGlobalSubscriptions() - onResultTabDeleted", data);

        tabStore.removeTab(data.tabDeleted.deleted.id);
        dashboardStore.removeTab(data.tabDelete.ddeleted.id);
      });

      // Group Subscriptions
      const { onResult: onResultGroupCreated } = useSubscription(SUBSCRIPTION_GROUP_CREATED);
      const { onResult: onResultGroupUpdated } = useSubscription(SUBSCRIPTION_GROUP_UPDATED);
      const { onResult: onResultGroupDeleted } = useSubscription(SUBSCRIPTION_GROUP_DELETED);

      onResultGroupCreated(({ data }) => {
        console.debug("startGlobalSubscriptions() - SUBSCRIPTION_GROUP_CREATED", data);

        groupStore.upsertGroup(data.groupCreated);
        dashboardStore.upsertGroup(data.groupCreated);
      });
      onResultGroupUpdated(({ data }) => {
        console.debug("startGlobalSubscriptions() - SUBSCRIPTION_GROUP_UPDATED", data);

        groupStore.upsertGroup(data.groupUpdated);
        dashboardStore.upsertGroup(data.groupUpdated);
      });
      onResultGroupDeleted(({ data }) => {
        console.debug("startGlobalSubscriptions() - SUBSCRIPTION_GROUP_DELETED", data);

        groupStore.removeGroup(data.groupDeleted.deleted.id);
        dashboardStore.removeGroup(data.groupDeleted.deleted.id, data.groupDeleted.deleted.tabId);
      });

      // Item Subscriptions
      const { onResult: onResultItemCreated } = useSubscription(SUBSCRIPTION_ITEM_CREATED);
      const { onResult: onResultItemUpdated } = useSubscription(SUBSCRIPTION_ITEM_UPDATED);
      const { onResult: onResultItemDeleted } = useSubscription(SUBSCRIPTION_ITEM_DELETED);

      onResultItemCreated(({ data }) => {
        console.debug("startGlobalSubscriptions() - SUBSCRIPTION_ITEM_CREATED", data);

        itemSore.upsertItem(data.itemCreated);
        dashboardStore.upsertItem(data.itemCreated);
      });
      onResultItemUpdated(({ data }) => {
        console.debug("startGlobalSubscriptions() - SUBSCRIPTION_ITEM_UPDATED", data);

        itemSore.upsertItem(data.itemUpdated);
        dashboardStore.upsertItem(data.itemUpdated);
      });
      onResultItemDeleted(({ data }) => {
        console.debug("startGlobalSubscriptions() - SUBSCRIPTION_ITEM_DELETED", data);

        itemSore.removeItem(data.itemDeleted.deleted.id);
        dashboardStore.removeItem(data.itemDeleted.deleted.id, data.itemDeleted.deleted.groupId);
      });
    });
  });
}

export function stopGlobalSubscriptions() {
  scope?.stop();
  scope = null;
}
