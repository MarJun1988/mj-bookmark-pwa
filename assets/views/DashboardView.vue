<template>
  <div class="grid grid-nogutter">
    <!-- Auflisten der Tab-Bereiche-->
    <div class="col-12">
      <div class="card border-round-md m-2">
        <TabView v-model:activeIndex="activeIndex" @tab-click="changeTabPanel($event)">
          <TabPanel v-for="tab in dashboardData" :key="tab.designation" :header="tab.designation"
                    headerClass="w-full flex justify-content-center">
          </TabPanel>
        </TabView>
      </div>
    </div>
    <!--  </div>-->
    <!-- Ansicht der Kategorien mit den Lesezeichen -->
    <div class="col-12">
      <div class="flex flex-wrap gap- justify-content-center md:justify-content-start">
        <div v-for="category in dashboardData[activeIndex].bookmarkCategories"
             v-if="dashboardData && dashboardData[activeIndex] && dashboardData[activeIndex].bookmarkCategories"
             class="w-12 md:w-6 lg:w-4 xl:w-3 xxl:w-2 p-3">
          <h3 class="text-center h-3rem"> {{ category.designation }}</h3>
          <Listbox v-model="selected" :options="category.bookmarks" class=""
                   optionLabel="name">
            <template #option="slotProps">
              <a v-tooltip.bottom="{value: slotProps.option.hyperlinkUrl, showDelay: 1000, hideDelay: 300}"
                 :href="slotProps.option.hyperlinkUrl" class="no-underline" target="_blank">
                <div class="flex align-items-center text-center">
                  <span class="text-green-200 min-w-full">{{ slotProps.option.hyperlinkDescription }}</span>
                </div>
              </a>
            </template>
          </Listbox>
        </div>
      </div>
    </div>
  </div>

</template>

<script setup>
import {useTabAreaStore} from "@/stores/Management/tabAreaStore";
import {storeToRefs} from "pinia";
import {onBeforeMount, ref, watch} from "vue";

// Store - Tab-Area
const storeTabArea = useTabAreaStore();
const {dashboardData} = storeToRefs(storeTabArea);

// Aktiver Tab Panel
const activeIndex = ref(0);
// Eintrag welches Selektiert ist im Listbox
const selected = ref(null);
// Aktion, beim wechsel des Tabes
const changeTabPanel = (event) => {
  // Abrufen der Lesezeichen
  storeTabArea.getForDashboard();
  // Speichern des Index im Local storage
  localStorage.setItem("Dashboard-Tab", parseInt(event.index))
}

// Überwachen, das die angeklickten links keine Markierung behalten
watch(selected, () => {
  selected.value = null;
  document.querySelectorAll(".p-focus").forEach(el => el.classList.remove('p-focus'));
});

onBeforeMount(() => {
  // Abrufen der Lesezeichen
  storeTabArea.getForDashboard();
  // Setzen, des letzten Tab Index
  activeIndex.value = localStorage.getItem("Dashboard-Tab") ? parseInt(localStorage.getItem("Dashboard-Tab")) : 0;
})
</script>


<style scoped>
.card {
  background: var(--surface-card);
  padding: 1rem;
  border-radius: 10px;
  margin-bottom: 1rem;
}

.p-tabview-nav-link {
  width: 100%;
}

.p-tabview-nav-link span {
  text-align: center;
  width: 100%;
}
</style>