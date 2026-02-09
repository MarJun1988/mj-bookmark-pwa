<script lang="ts" setup>
import { onMounted } from "vue";
import { useDashboardStore } from "@/stores/dashboard.store.ts";
import UserSettingTabOne from "@/views/profile/UserSettingTabOne.vue";
import UserSettingTabTwo from "@/views/profile/UserSettingTabTwo.vue";
import UserSettingTabThree from "@/views/profile/UserSettingTabThree.vue";
import UserSettingTabFour from "@/views/profile/UserSettingTabFour.vue";

const dashboardStore = useDashboardStore();

onMounted(async () => {
  await dashboardStore.bootstrapDashboard();
});
</script>
<template>
  <Tabs
    class="w-full"
    value="0"
  >
    <TabList class="bg-(--p-surface-section)">
      <Tab value="0">
        allgemeines
      </Tab>
      <Tab value="1">
        Kennwort ändern
      </Tab>
      <Tab value="2">
        Daten anfordern (DSGVO)
      </Tab>
      <Tab value="3">
        Konto löschen
      </Tab>
    </TabList>
    <TabPanels class="bg-(--p-surface-section)">
      <!-- allgemeines -->
      <TabPanel value="0">
        <UserSettingTabOne />
      </TabPanel>
      <!-- Kennwort ändern -->
      <TabPanel value="1">
        <UserSettingTabTwo />
      </TabPanel>
      <!-- Meine Daten anfordern (DSGVO) -->
      <TabPanel value="2">
        <UserSettingTabThree />
      </TabPanel>
      <!-- Konto löschen -->
      <TabPanel value="3">
        <UserSettingTabFour />
      </TabPanel>
    </TabPanels>
  </Tabs>
</template>
