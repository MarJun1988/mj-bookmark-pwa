<template>
  <DataTable ref="dt" v-model:filters="filters" v-model:selection="selectedItem"
             :currentPageReportTemplate="currentPageReportTemplate"
             :globalFilterFields="globalFilterFields"
             :loading="loading" :multi-sort-meta="multiSort" :rowHover="true"
             :rows="defaultRows" :rowsPerPageOptions="rowsPerPage" :selectAll="selectAll" :stateKey="stateKey"
             :totalRecords="dataTotalCount"
             :value="dataForTable" class="p-datatable-sm m-4" columnResizeMode="fit"
             dataKey="id"
             filterDisplay="row" lazy
             paginator
             paginator-position="both"
             paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
             sortMode="multiple" stateStorage="local"
             stripedRows
             @filter="loadLazyData($event)"
             @page="loadLazyData($event)" @sort="loadLazyData($event)">

    <!-- Kopf über der Tabelle -->
    <template #header>
      <div class="flex flex-wrap justify-content-around md:justify-content-between">
        <!-- Text ganz links nur bei großen Bildschirmen-->
        <div class="flex flex-order-1 md:flex-order-0">
          <!-- Auswahl der Spalten die Sichtbar sind -->
          <MultiSelect v-if="viewSelectedColumns" :maxSelectedLabels="3"
                       :modelValue="tableSelectedColumns"
                       :options="columns" :placeholder="components.dataTable.selectColumnsPlaceholder"
                       :selectedItemsLabel="selectedItemsLabel" class="mr-4 max-wid" optionLabel="header"
                       style="max-width: 300px" @update:modelValue="onToggle($event)"/>
        </div>

        <!-- Knopf in der Mitte, um einen neuen Eintrag zu erstellen -->
        <div class="flex flex-order-2 md:flex-order-1">
          <Button v-tooltip.bottom="components.dataTable.buttons.addItem.tooltip"
                  :label="components.dataTable.buttons.addItem.label"
                  aria-describedby="Add Item" class="hidden lg:block" raised severity="warning" @click="emit('itemAdd')"/>
          <Button v-tooltip.bottom="components.dataTable.buttons.addItem.tooltip"
                  aria-describedby="Add Item" class="block lg:hidden"
                  icon="pi pi-plus-circle" raised severity="warning" @click="emit('itemAdd')"/>
          <Button v-tooltip.bottom="components.dataTable.buttons.reloadData.tooltip"
                  aria-describedby="Reload Data" aria-label="Bookmark" class="ml-2" icon="pi pi-refresh" raised
                  severity="secondary" @click="loadLazyData(lazyParams)"/>
        </div>

        <!-- Suchfeld ganz rechts (Globale Suche für alle Spalten) -->
        <div class="flex flex-order-0 md:flex-order-2">
          <span class="p-input-icon-left">
                    <i class="pi pi-search"/>
                    <InputText v-model="filters['global'].value" :placeholder="components.dataTable.searchPlaceholder"
                               @keyup="loadLazyData"/>
            </span>
        </div>
      </div>
    </template>

    <template #paginatorstart>
    </template>
    <template #paginatorend>
    </template>

    <!-- Standard Meldungen -->
    <template #empty class="flex">
      <div class="flex-none flex align-items-center justify-content-center font-bold">{{
          components.dataTable.emptyItems
        }}
      </div>
    </template>
    <!-- Daten werden geladen -->
    <template #loading>
      <ProgressSpinner/>
    </template>
    <!--    <template #loading>{{ components.dataTable.loadingItems }} </template>-->

    <!-- Erstellen der Einzelnen Spalten -->
    <template v-for="col of tableSelectedColumns">
      <Column v-if="col.showing" :key="col.field" :data-type="col.dataType" :field="col.field"
              :filter-field="col.filterField" :header="col.header" :showFilterMenu="col.showFilterMenu ?? true" :sort-field="col.sortField"
              :sortable="col.sortable" class="text-center">

        <!-- Ist es ein Objekt {id: ..., abbreviation: ...} -->
        <template v-if="col && col.hasSubfield" #body="slotProps">

          <!-- Datum -->
          <template v-if="col && col.filterTyp && col.filterTyp === 'date'">
            {{ formatDate(subField(col.field, slotProps.data[col.mainField])) }}
          </template>

          <!-- Datum und Uhrzeit -->
          <template v-else-if="col && col.filterTyp && col.filterTyp === 'dateTime'">
            {{ formatDatetime(subField(col.field, slotProps.data[col.mainField])) }}
          </template>

          <!-- ja/nein Wert (Boolean) -->
          <template v-else-if="col && col.filterTyp && col.filterTyp === 'boolean'">
            <i :class="{ 'pi-check-circle text-green-500': subField(col.field, slotProps.data[col.mainField]), 'pi-times-circle text-red-400': !subField(col.field, slotProps.data[col.mainField]) }"
               class="pi"></i>
          </template>

            <!-- Text alleine -->
          <template v-else-if="col  && col.hasSubfield && col.hasSubfieldTwo">
            {{ subField(col.field, slotProps.data[col.mainField][col.subField]) }}
          </template>

          <!-- Text alleine -->
          <template v-else>
            {{ subField(col.field, slotProps.data[col.mainField]) }}
          </template>
        </template>

        <!-- Datum -->
        <template v-else-if="col && col.filterTyp && col.filterTyp === 'date'" #body="slotProps">
          {{ formatDate(slotProps.data[slotProps.field]) }}
        </template>

        <!-- Datum und Uhrzeit -->
        <template v-else-if="col && col.filterTyp && col.filterTyp === 'dateTime'" #body="slotProps">
          {{ formatDatetime(slotProps.data[slotProps.field]) }}
        </template>

        <!-- ja/nein Wert (Boolean) -->
        <template v-else-if="col && col.filterTyp && col.filterTyp === 'boolean'" #body="slotProps">
          <i :class="{ 'pi-check-circle text-green-500': slotProps.data[slotProps.field], 'pi-times-circle text-red-400': !slotProps.data[slotProps.field] }"
             class="pi"></i>
        </template>

        <!-- Text alleine, aber mit einer Funktion ausführen -->
        <template v-else-if="col && col.usedFunction" #body="slotProps">
          <!-- Anzahl der Einträge -->
          <template v-if="col.usedFunction === 'showCount'">
            <span>{{
                slotProps.data && slotProps.data[slotProps.field] ? slotProps.data[slotProps.field].length : 0
              }}</span>
          </template>
        </template>

        <!-- Text alleine -->
        <template v-else #body="slotProps">
          {{ slotProps.data[slotProps.field] }}
        </template>

        <!-- Filter -->
        <template v-if="col.filter && col.showing" #filter="{ filterModel, filterCallback }">
          <!-- Wenn die Ausgabe eine Datum ist -->
          <Calendar v-if="col && col.filterTyp && (col.filterTyp === 'date' || col.filterTyp === 'dateTime')"
                    v-model="filterModel.value"
                    dateFormat="dd/mm/yy" mask="99/99/9999"
                    placeholder="dd/mm/yyyy"/>

          <!-- Wenn die Ausgabe eine Text (String) ist -->
          <InputText
              v-else-if="col && col.filterTyp && col.filterTyp === 'text'"
              v-model="filterModel.value"
              :placeholder="components.dataTable.searchPlaceholder"
              class="p-column-filter" @input="filterCallback()"/>

          <!-- Wenn die Ausgabe eine Zahl ist -->
          <InputNumber
              v-else-if="col && col.filterTyp && col.filterTyp === 'numeric'"
              v-model="filterModel.value"
              :placeholder="components.dataTable.searchPlaceholder"
              class="p-column-filter" @input="filterCallback()"/>

          <TriStateCheckbox v-else-if="col && col.filterTyp && col.filterTyp === 'boolean'" v-model="filterModel.value"
                            @change="filterCallback()"/>

          <MultiSelect v-else-if="col && col.filterTyp && col.filterTyp === 'multiSelect'" v-model="filterModel.value"
                       :maxSelectedLabels="1" :options="col.filterOptions" :placeholder="components.dataTable.multiSelectPlaceholder"
                       :selectedItemsLabel="multiSelectItemsLabel" class="p-column-filter" option-label="designation" option-value="designation" @change="filterCallback()">
            <template #option="slotProps">
              <div class="flex align-items-center gap-2">
<!--                <img :alt="slotProps.option.name" :src="`https://primefaces.org/cdn/primevue/images/avatar/${slotProps.option.image}`" style="width: 32px" />-->
                <span>{{ slotProps.option.designation }}</span>
              </div>
            </template>
          </MultiSelect>

        </template>
      </Column>
    </template>

    <!-- Aktions Spalte -->
    <column v-if="columnAction" :header="components.dataTable.columnActionsHeadline" style="width: 10rem">
      <template #body="slotProps">
        <!-- bearbeiten -->
        <Button v-tooltip.left="components.dataTable.buttons.editItem.tooltip"
                :aria-describedby="`Edit-${slotProps.data.id}`" :icon="components.dataTable.buttons.editItem.icon"
                aria-label="Edit Item"
                class="m-1" rounded
                severity="secondary" text @click="emit('itemEdit', slotProps.data)"/>
        <!-- löschen -->
        <Button v-tooltip.left="components.dataTable.buttons.deleteItem.tooltip"
                :aria-describedby="`Delete-${slotProps.data.id}`" :icon="components.dataTable.buttons.deleteItem.icon"
                aria-label="Delete Item"
                class="m-1"
                rounded
                severity="danger" text @click="emit('itemDelete', slotProps.data)"/>
      </template>
    </column>
  </DataTable>
</template>

<script setup>
import {storeToRefs} from "pinia";
import {onMounted, ref, watch} from "vue";
import {useDataTableStore} from "@/stores/dataTable";
import {useTranslationsStore} from "@/stores/translations"; // Variable die auf mit von der Component erwartet werden

// Variable die auf mit von der Component erwartet werden
const props = defineProps({
  dataForTable: {
    type: Array,
    required: true,
  },
  dataTotalCount: {
    type: Number,
    required: true,
  },
  loading: {
    type: Boolean,
    required: true,
  },
  headerText: {
    type: String,
    required: true,
  },
  filters: {
    type: Object,
    required: true,
  },
  globalFilterFields: {
    type: Array,
    required: true,
  },
  columns: {
    type: Array,
    required: true,
  },
  viewSelectedColumns: {
    type: Boolean,
    required: false,
    default: false,
  },
  columnAction: {
    type: Boolean,
    required: false,
    default: true,
  },
  multiSortMeta: {
    type: Array,
    required: true,
  },
  stateKey: {
    type: String,
    required: false,
  }
});

// Events die abgefeuert werden
const emit = defineEmits(['fetchData', 'itemAdd', 'itemEdit', 'itemDelete']);

// Store - Translations
const storeTranslations = useTranslationsStore();
const {components} = storeTranslations;

// Template Text für die Paginator (unter der Tabelle)
const currentPageReportTemplate = `{first} ${components.dataTable.pageReportTemplateOne} {last} ${components.dataTable.pageReportTemplateTwo} {totalRecords} ${components.dataTable.pageReportTemplateThree}`;

// Standard Einstellungen
// Einträge pro Seite
const rowsPerPage = ref([5, 10, 25, 50, 100]);
const defaultRows = ref(25);
const selectedItemsLabel = `{0} ${components.dataTable.selectColumnsItems}`;
const multiSelectItemsLabel = `{0} ${components.dataTable.multiSelectItems}`;

// Referenzen zur Tabelle
const dt = ref();
const selectedItem = ref();
const selectAll = ref(false);
const filters = ref({...props.filters});
const multiSort = ref([...props.multiSortMeta]);

// Store - Einstellungen des Data Tables
const storeDataTable = useDataTableStore();
const {lastLazyParams} = storeToRefs(storeDataTable);

const lazyParams = ref({
  first: 0,
  rows: dt.d_rows,
  sortField: null,
  sortOrder: null,
  filters: filters.value,
  multiSortMeta: []
});

// Ausgewählte Spalten
const tableSelectedColumns = ref(props.columns.filter(cal => cal.defaultView));

// Sichtbarkeit der Spalten
const onToggle = async (val) => {
  tableSelectedColumns.value = props.columns.filter(col => val.includes(col));
};

// Daten Laden bei Änderungen in der Tabelle
const loadLazyData = (event) => {
  lazyParams.value = {
    first: 0,
    rows: dt.value.d_rows,
    sortField: null,
    sortOrder: null,
    filters: filters.value,
    multiSortMeta: props.multiSortMeta,
  };

  if (event) {
    if (event.first) {
      lazyParams.value.first = event.first;
    }

    if (event.multiSortMeta) {
      lazyParams.value.multiSortMeta = event.multiSortMeta;
    }
  }

  emit('fetchData', lazyParams.value);
};

// Formatierung Datum
const formatDate = (value) => {
  if (value) {
    let date = new Date(value);

    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
  return '';
};

// Formatierung Datum Zeit
const formatDatetime = (value) => {
  if (value) {
    let date = new Date(value);

    return date.toLocaleTimeString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hours: '2-digit',
      minutes: '2-digit'
    });
  }
  return '';
};

// Ausgabe für in Objekt
const subField = (field, element) => {
  let str = field.split('.');
  if (str.length > 0) {
    return element[str[1]];
  }
}

// Beim Einbinden der Component ausführen
onMounted(() => {
  loadLazyData(lazyParams);
});

// Einstellungen Store Abspeichern
watch(lazyParams, async (newValue) => {
  lastLazyParams.value = await newValue;
});
</script>

<style lang="scss">
.p-column-title {
  width: 100%;
}
</style>