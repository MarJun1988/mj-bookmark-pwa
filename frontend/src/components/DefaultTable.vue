<script lang="ts" setup>
import { storeToRefs } from "pinia";
import { computed, type ComputedRef, onMounted, ref, type Ref, watch } from "vue";
import { useCommonStore } from "@/stores/common.store.ts";
import type { CustomColumnProps, Tag, User } from "@/utils/interfaces.ts";
import type { DataTableFilterMeta } from "primevue/datatable";
import type { DataTableFilterEvent, DataTableFilterMetaData } from "primevue";
import { type Router, useRouter } from "vue-router";
import type { useUserStore } from "@/stores/user.store.ts";
import { useUiStore } from "@/stores/ui.store";
import { useVersionStore } from "@/stores/version.store.ts";
import { useTabStore } from "@/stores/tab.store.ts";
import { useGroupStore } from "@/stores/group.store.ts";
import { useItemStore } from "@/stores/item.store.ts";
import { useTagStore } from "@/stores/tag.store.ts";

type UserStore = ReturnType<typeof useUserStore>;
type VersionStore = ReturnType<typeof useVersionStore>;
type TabStore = ReturnType<typeof useTabStore>;
type GroupStore = ReturnType<typeof useGroupStore>;
type ItemStore = ReturnType<typeof useItemStore>;
type TagStore = ReturnType<typeof useTagStore>;

const props = withDefaults(
  defineProps<{
    store: UserStore | VersionStore | TabStore | GroupStore | ItemStore | TagStore;
    deleteDisabled?: boolean;
    stateKey: string;
    notShowActionButton?: {
      create?: boolean;
      update?: boolean;
      delete?: boolean;
      refreshFavicon?: boolean;
    };
    stateVersion?: number;
  }>(),
  {
    deleteDisabled: false,
    notShowActionButton: () => ({
      create: false,
      update: false,
      delete: false,
      refreshFavicon: true,
    }),
    stateVersion: 1,
  },
);

/* ======================
   Emits
====================== */
const emits = defineEmits<{
  refreshFavicons: [];
}>();

const ui = useUiStore();

// Pinia Stores
const storeCommon = useCommonStore();

const { isLoading } = storeToRefs(storeCommon);
const { pagedItems, totalCount, pageSize, columns, multiSortMeta } = storeToRefs(props.store);

// Template Text für die Paginator (unter der Tabelle)
const currentPageReportTemplate = `{first} bis {last} von {totalRecords} Einträgen`;
const rowsPerPageOptions: number[] = [1, 5, 10, 20, 25, 50, 75, 100, 500, 1000, 5000];
const selectedItems: Ref<User[]> = ref([]);

/**
 * Ausgewählte Spalten, die angezeigt werden sollen
 */
const selectedColumns: Ref<CustomColumnProps[]> = ref(
  columns.value.filter((column: CustomColumnProps) => column?.defaultShowing === true),
);

/**
 * Umschalten der Anzuzeigende Spalten
 * @param val
 */
const onToggle = (val: CustomColumnProps[]) => {
  selectedColumns.value = columns.value.filter((col: CustomColumnProps) => val.includes(col));
};

// Filter für die Tabelle
const filters: Ref<DataTableFilterMeta> = ref({
  ...props.store.defaultFilters,
});

// Erst Initialisierung des Filters
const initFilters = () => (filters.value = { ...props.store.defaultFilters });

// Löschen der gesamten Werte
const clearFilter = () => {
  initFilters();
  onGlobalSearch();
  globalFilter.value = null;
};

// das Search-Event
const onGlobalSearch = async () => {
  await props.store.onLazyLoad({
    first: 0,
    rows: pageSize.value,
    sortField: undefined,
    sortOrder: null,
    multiSortMeta: [],
    filters: filters.value,
  });
};

// const defaultMultiSortMeta: Ref<DataTableSortMeta[]> = ref([...multiSortMeta.value])

// Event beim Filter auswahl
const onFilter = async (event: DataTableFilterEvent) => {
  filters.value = event.filters; // aktualisieren (damit matchModes erhalten bleiben)
  await props.store.onLazyLoad({
    first: 0,
    rows: pageSize.value,
    sortField: undefined,
    sortOrder: null,
    multiSortMeta: multiSortMeta.value,
    filters: event.filters,
  });
};

/**
 * Globaler Filter für die Lazy Loading events
 */
const globalFilter = computed({
  get: () => (filters.value["global"] as DataTableFilterMetaData).value,
  set: (val) => ((filters.value["global"] as DataTableFilterMetaData).value = val),
});

const router: Router = useRouter();

const storageKey = computed(() => `${props.stateKey}:v${props.stateVersion}`);

const tagStore = useTagStore();
const groupStore = useGroupStore();
const tabStore = useTabStore();

const filterOptionsMap = {
  tags: computed(() => tagStore.allItemsForSelect),
  groups: computed(() => groupStore.allItemsForSelect),
  tabs: computed(() => tabStore.allItemsForSelect),
};

// Bestätigungsdialog zum Löschen dem markierten Elemente
const deleteSelectedItemsDialog: Ref<boolean> = ref(false);

const confirmDeleteSelected = () => {
  deleteSelectedItemsDialog.value = true;
};

const deleteSelectedItems = async () => {
  const ids = selectedItems.value.map((selectedItem) => selectedItem.id);
  const chunkSize = 500;
  for (let i = 0; i < ids.length; i += chunkSize) {
    const slice = ids.slice(i, i + chunkSize);
    await props.store.deleteItem(slice);
  }

  deleteSelectedItemsDialog.value = false;
  selectedItems.value = [];
};

const tooltipButtonDeleteSelected: ComputedRef<string> = computed(() => {
  const count = selectedItems.value.length;

  if (isDisabled.value) {
    return `Funktion deaktiviert durch Entwickler!`;
  }

  if (count === 1) {
    return `1 Eintrag löschen`;
  } else if (count > 1) {
    return `${count} Einträge löschen`;
  } else {
    return "Keine Einträge ausgewählt";
  }
});

// Registers a callback to be called after the component has been mounted.
onMounted(async () => {
  await props.store.onLazyLoad({
    first: 0,
    rows: pageSize.value,
    multiSortMeta: multiSortMeta.value,
  });
  restoreSelectedColumns();
});

const isDev: Ref<boolean> = ref(false);
const isDisabled: ComputedRef<boolean> = computed(() => {
  return props.deleteDisabled && !isDev.value;
});

if (import.meta.env.DEV) {
  isDev.value = true;
}

watch(
  selectedColumns,
  (cols) => {
    localStorage.setItem(
      `${storageKey.value}-selected-columns`,
      JSON.stringify(cols.map((c) => c.columnKey)),
    );
  },
  { deep: true },
);

const restoreSelectedColumns = () => {
  const stored = localStorage.getItem(`${storageKey.value}-selected-columns`);

  if (!stored) return;

  const ids: string[] = JSON.parse(stored);

  selectedColumns.value = columns.value.filter(
    (col) => col.columnKey && ids.includes(col.columnKey),
  );
};

const getNestedValue = (obj: any, path: string) => {
  return path.split(".").reduce((acc, key) => acc?.[key], obj);
};

const showSkeleton = ref(false);
const skeletonUntil = ref(0);

const MIN_SKELETON_MS = 300; // fühl dich frei: 120–250

watch(isLoading, (loading) => {
  if (loading) {
    showSkeleton.value = true;
    skeletonUntil.value = Date.now() + MIN_SKELETON_MS;
    return;
  }

  // loading finished: erst nach Mindestdauer ausblenden
  const remaining = skeletonUntil.value - Date.now();
  if (remaining > 0) {
    window.setTimeout(() => {
      showSkeleton.value = false;
    }, remaining);
  } else {
    showSkeleton.value = false;
  }
});

const tableRows = computed(() => {
  if (showSkeleton.value) {
    return Array.from({ length: pageSize.value }, (_, i) => ({
      __skeleton: true,
      id: `skeleton-${i}`,
    }));
  }

  return pagedItems.value;
});

const hasActiveFilters = computed(() => {
  return Object.entries(filters.value).some(([, meta]) => {
    if (!meta || typeof meta !== "object") return false;

    const value = (meta as any).value;

    if (Array.isArray(value)) {
      return value.length > 0;
    }

    return value !== null && value !== undefined && value !== "";
  });
});
</script>

<template>
  <!-- Löschen mehrere -->
  <Dialog
    v-model:visible="deleteSelectedItemsDialog"
    :block-scroll="true"
    :modal="true"
    :style="{ width: '450px' }"
    header="Bestätigung: mehrere Einträge löschen"
    pt:footer="border-t"
    pt:header="border-b"
  >
    <div class="flex items-center gap-4 mt-4">
      <i class="pi pi-exclamation-triangle text-3xl!" />
      <span v-if="selectedItems && selectedItems.length > 0">
        Sind Sie sicher, dass Sie die ausgewählten Einträge
        <b>({{ selectedItems.length }})</b> löschen möchten?</span
      >
    </div>
    <template #footer>
      <div class="flex flex-wrap gap-4 mt-4">
        <Button
          icon="pi pi-times"
          label="Nein"
          severity="secondary"
          text
          @click="deleteSelectedItemsDialog = false"
        />
        <Button
          icon="pi pi-check"
          label="Ja"
          severity="danger"
          text
          @click="deleteSelectedItems()"
        />
      </div>
    </template>
  </Dialog>
  <div class="bg-(--p-content-background) rounded-xl p-5 flex-1 flex flex-col">
    <DataTable
      ref="dt"
      v-model:filters="filters"
      v-model:rows="pageSize"
      v-model:selection="selectedItems"
      :current-page-report-template="currentPageReportTemplate"
      :global-filter-fields="['name']"
      :loading="isLoading"
      :multi-sort-meta="store.multiSortMeta"
      :rows-per-page-options="rowsPerPageOptions"
      :stateKey="storageKey"
      :total-records="totalCount"
      :value="tableRows"
      class="m-5"
      data-key="id"
      filter-display="row"
      lazy
      paginator
      paginator-position="both"
      paginator-template="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink  RowsPerPageDropdown"
      row-hover
      sort-mode="multiple"
      stateStorage="local"
      striped-rows
      @filter="onFilter($event)"
      @page="store.onLazyLoad($event)"
      @sort="store.onLazyLoad($event)"
    >
      <!-- Kopfzeile -->
      <template #header>
        <div class="flex flex-wrap gap-2 justify-between">
          <!-- Sichtbare Spalten -->
          <div class="w-full md:w-50">
            <FloatLabel :variant="ui.floatLabelVariant">
              <MultiSelect
                :max-selected-labels="3"
                :model-value="selectedColumns"
                :options="columns"
                :selected-items-label="`{0} Spalten`"
                class="w-full"
                filter
                fluid
                input-id="multi-select-columns"
                option-label="header"
                show-clear
                @update:model-value="onToggle"
              />
              <label for="multi-select-columns">Sichtbare Spalten</label>
            </FloatLabel>
          </div>
          <!-- Knöpfe -->
          <div class="w-full sm:w-auto flex justify-center">
            <!-- erstllen -->
            <div v-if="!props.notShowActionButton.create" class="m-auto">
              <Button
                v-tooltip.right="{
                  value: 'Neuen Eintrag erstellen',
                  pt: {
                    text: '!w-55 text-center',
                  },
                }"
                class="mr-2"
                icon="pi pi-plus"
                @click="router.push(store.routeToNewItem())"
              />
            </div>
            <!-- löschen -->
            <div v-if="!props.notShowActionButton.delete" class="m-auto z-10">
              <OverlayBadge :value="selectedItems.length" severity="danger">
                <Button
                  v-tooltip.right="{
                    value: tooltipButtonDeleteSelected,
                    pt: {
                      text: '!w-55 text-center',
                    },
                  }"
                  :disabled="!selectedItems || !selectedItems.length || isDisabled"
                  icon="pi pi-trash"
                  severity="danger"
                  @click="confirmDeleteSelected"
                />
              </OverlayBadge>
            </div>
            <!-- Favicon Download für alle -->
            <div v-if="!props.notShowActionButton.refreshFavicon" class="m-auto">
              <Button
                v-tooltip.right="{
                  value: 'Favicons aktualisieren',
                  pt: {
                    text: '!w-55 text-center',
                  },
                }"
                class="ml-2"
                icon="pi pi-refresh"
                @click="emits('refreshFavicons')"
              />
            </div>
          </div>
          <!-- Suche -->
          <div class="w-full sm:w-auto justify-items-end flex gap-4 mt-4 md:mt-0">
            <FloatLabel :variant="ui.floatLabelVariant">
              <IconField>
                <InputIcon>
                  <i class="pi pi-search" />
                </InputIcon>
                <InputText
                  id="input-search"
                  v-model="globalFilter"
                  clearable
                  fluid
                  size="small"
                  @update:model-value="onGlobalSearch"
                />
              </IconField>
              <label for="input-search">suchen ...</label>
            </FloatLabel>
            <!-- Filter Löschen-->
            <Button
              v-tooltip.left="'Filter löschen...'"
              class="w-15"
              icon="pi pi-filter-slash"
              type="button"
              variant="outlined"
              :severity="hasActiveFilters ? 'danger' : 'secondary'"
              @click="clearFilter()"
            />
          </div>
        </div>
      </template>

      <!-- Keine Einträge -->
      <template #empty> Keine Einträge gefunden! </template>
      <!-- Ladeanzeige -->
      <template #loading> Daten werden geladen ... </template>
      <!--      Paginator-->
      <template
        #paginatorcontainer="{
          first,
          last,
          page,
          pageCount,
          pageLinks,
          prevPageCallback,
          nextPageCallback,
          firstPageCallback,
          lastPageCallback,
          totalRecords,
          rows,
          rowChangeCallback,
          changePageCallback,
        }"
      >
        <div class="flex flex-wrap w-full gap-4 justify-between items-center">
          <!-- Anzahl pro Seite -->
          <div class="hidden sm:block">
            <Select
              :model-value="rows"
              :options="rowsPerPageOptions"
              size="small"
              @update:model-value="rowChangeCallback"
            />
          </div>
          <!-- zurück und vor -->
          <div class="w-full sm:w-auto flex justify-center">
            <!-- 1te Seite -->
            <Button
              :disabled="page === 0"
              icon="pi pi-angle-double-left"
              size="small"
              text
              @click="firstPageCallback"
            />
            <!-- 1 Seite zurück-->
            <Button :disabled="page === 0" icon="pi pi-angle-left" text @click="prevPageCallback" />

            <!-- Knöpfe mit Zahlen -->
            <Button
              v-for="(pageL, index) in pageLinks"
              :key="index"
              :disabled="pageL === page + 1"
              :label="`${pageL}`"
              :text="pageL !== page + 1"
              size="small"
              @click="changePageCallback(pageL - 1)"
            />
            <!-- 1 Seite weiter -->
            <Button
              :disabled="page && pageCount ? page === pageCount - 1 : false"
              icon="pi pi-angle-right"
              size="small"
              text
              @click="nextPageCallback"
            />
            <!-- letzte Seite -->
            <Button
              :disabled="page && pageCount ? page === pageCount - 1 : false"
              icon="pi pi-angle-double-right"
              size="small"
              text
              @click="lastPageCallback"
            />
          </div>
          <!-- Anzahl -->
          <div class="w-full sm:w-auto text-center">
            <span> {{ first }} bis {{ last }} von {{ totalRecords }} Einträgen </span>
          </div>
        </div>
      </template>
      <!-- Spalte zum Selektieren -->
      <Column
        :exportable="false"
        class=""
        exclude-global-filter
        selection-mode="multiple"
        style="width: 3rem"
      />
      <!-- Anzuzeigende Spalten  -->
      <Column
        v-for="(col, index) of selectedColumns"
        :key="col.field + '_' + index"
        :body-class="col.bodyClass"
        :class="col.class"
        :data-type="col.dataType"
        :field="col.field"
        :filter-field="col.filterField ?? col.field"
        :header="col.header"
        :header-class="`${col.headerClass}`"
        :showFilterMenu="col.dataType !== 'multiselect'"
        :sortable="true"
        class=""
      >
        <template #body="slotProps">
          <Skeleton v-if="slotProps.data.__skeleton" class="min-h-9.20" />

          <template v-else-if="slotProps.field === 'tags.id'">
            <div class="flex flex-wrap gap-1 max-w-48">
              <Tag v-for="tag in slotProps.data.tags.slice(0, 2)" :key="tag.id" :value="tag.name" />
              <Tag
                v-if="slotProps.data.tags.length > 2"
                v-tooltip.top="slotProps.data.tags.map((t: Tag) => t.name).join(', ')"
                :value="`+${slotProps.data.tags.length - 2}`"
                class="text-xs"
                severity="info"
              />
            </div>
          </template>

          <!-- Spezialfall: Titel + Favicon -->
          <template v-else-if="col.withIcon">
            <div class="flex items-center gap-2 min-w-0">
              <!-- Favicon -->
              <div
                v-if="col.options?.icon?.field"
                class="w-4 h-4 shrink-0 rounded-sm bg-surface-border flex items-center justify-center text-[10px]"
              >
                <img
                  v-if="col.options?.icon?.field && slotProps.data[col.options.icon.field]"
                  :src="slotProps.data[col.options.icon.field]"
                  alt=""
                  class="w-4 h-4 shrink-0"
                />
                <span v-else>🌐</span>
              </div>

              <!-- Titel -->
              <span class="truncate">
                {{ slotProps.data.title }}
              </span>
            </div>
          </template>

          <!-- Default Fallback -->
          <template v-else>
            {{
              typeof slotProps.field === "string"
                ? getNestedValue(slotProps.data, slotProps.field)
                : typeof slotProps.field === "function"
                  ? slotProps.field(slotProps.data)
                  : ""
            }}
          </template>
        </template>

        <template v-if="!col.filterNotShowing" #filter="{ filterModel, filterCallback }">
          <FloatLabel :variant="ui.floatLabelVariant">
            <Select
              v-if="col.dataType === 'text' && col.field === 'role'"
              v-model="filterModel.value"
              :options="[
                { label: 'User', value: 'USER' },
                { label: 'Admin', value: 'ADMIN' },
              ]"
              fluid
              optionLabel="label"
              optionValue="value"
              @change="filterCallback()"
            />
            <InputText
              v-if="col.dataType === 'text' && col.field !== 'role'"
              :id="`input-search-${col.field}`"
              v-model="filterModel.value"
              fluid
              type="text"
              @input="filterCallback()"
            />
            <!-- Wenn die Ausgabe eine Datum ist -->
            <DatePicker
              v-if="col.dataType === 'date'"
              v-model="filterModel.value"
              date-format="dd/mm/yy"
              fluid
              mask="99/99/9999"
              show-clear
            />
            <InputNumber
              v-if="col.dataType === 'numeric'"
              v-model="filterModel.value"
              @input="
                (e) => {
                  filterModel.value = e.value;
                  filterCallback();
                }
              "
            />

            <MultiSelect
              v-if="col.dataType === 'multiselect' && col.filterKey !== undefined"
              v-model="filterModel.value"
              :options="filterOptionsMap[col.filterKey]?.value ?? []"
              display="chip"
              filter
              fluid
              optionLabel="label"
              optionValue="value"
              @change="
                () => {
                  filterModel.value = Array.isArray(filterModel.value)
                    ? filterModel.value.filter((v) => v != null)
                    : [];
                  filterCallback();
                }
              "
            />

            <label
              v-if="col.dataType === 'text'"
              :for="`input-search-${col.field}`"
              class="hidden sm:block"
              >suchen ...</label
            >
            <label
              v-if="col.dataType === 'date'"
              :for="`input-search-${col.field}`"
              class="hidden sm:block"
              >dd/mm/yyyy</label
            >
            <label
              v-if="col.dataType === 'multiselect'"
              :for="`input-search-${col.field}`"
              class="hidden sm:block"
              >auswahl ...</label
            >
          </FloatLabel>
        </template>
      </Column>

      <!-- Aktionsspalte -->
      <Column
        v-if="!props.notShowActionButton.update && !props.notShowActionButton.delete"
        :exportable="false"
        :pt="{
          columnHeaderContent: {
            class: 'justify-center ',
          },
        }"
        class="min-w-30 w-30 max-w-30"
        exclude-global-filter
        header="Aktionen"
      >
        <template #body="slotProps">
          <div class="flex flex-wrap justify-between gap-2">
            <Button
              v-if="!props.notShowActionButton.update"
              icon="pi pi-pencil"
              rounded
              size="small"
              variant="outlined"
              @click="router.push(store.routeToEditItem(slotProps.data))"
            />
            <Button
              v-if="!props.notShowActionButton.delete"
              :disabled="isDisabled"
              icon="pi pi-trash"
              rounded
              severity="danger"
              size="small"
              variant="outlined"
              @click="router.push(props.store.routeToDeleteItem(slotProps.data))"
            />
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>
