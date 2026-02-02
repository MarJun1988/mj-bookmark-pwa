<template>
  <div class="grid mt-2 pt-2">
    <template v-for="(field, index) in fields">
      <template v-if="!onlyDeleteFields || (onlyDeleteFields && field.showForDelete)">
      <!-- Einfaches Textfeld -->
      <div v-if="field.fieldType === 'inputText' && !field.onFocusOut" v-show="field.fieldType === 'inputText'" :class="field.cssClass"
           class="font-bold">
          <span :class="{ 'min-w-full': !field.fieldNotFullWidth}" class="p-float-label p-input-icon-right">
             <i v-show="field.withIcon" v-tooltip="`${field.tooltip}`" :aria-describedby="index+'-icon'"
                :aria-label="index" :class="field.icon + field.iconClass"
                :style="field.styleIcon" @click="emit(`${field.actionMethode}`, $event)"/>
            <InputText :id="index" v-model="item[index]"
                       :aria-describedby="index+'-help'" :autofocus="field.autofocus"
                       :class="[{ 'min-w-full': !field.fieldNotFullWidth}, {'p-invalid': !item[index] && field.required}]"
                       :disabled="disabledAllFields || field.disabled"
                       :max="parseInt(field.maxlength)"
                       :maxlength="field.maxlength"
                       :min="parseInt(field.maxlength)"
                       :minlength="field.minlength"
                       :readonly="readOnlyAllFields || field.readonly" :required="Boolean(field.required)"/>
<!--             <Button v-show="field.withIcon" :class="field.iconClass" :icon="field.icon" aria-label="Submit" style="position: absolute;right: 3px; top: 5px;" />-->


            <label :for="index"><required-star v-if="field.required"/>{{ field.label }}</label>
          </span>
        <div class="flex justify-content-between flex-wrap m-2">
          <small v-if="item[index]" class="fadeinleft animation-duration-200 font-light font-italic">
            {{ generals.numberOfCharacters }} {{
              item[index].length
            }}/{{ field.maxlength }}</small>
          <small :id="index+'-help'">{{ field.help }}</small>
        </div>
      </div>
        <!-- Einfaches Textfeld mit Event Klick-->
        <div v-if="field.fieldType === 'inputText' && field.onFocusOut" v-show="field.fieldType === 'inputText'" :class="field.cssClass"
             class="font-bold">
          <span :class="{ 'min-w-full': !field.fieldNotFullWidth}" class="p-float-label p-input-icon-right">
             <i v-show="field.withIcon" v-tooltip="`${field.tooltip}`" :aria-describedby="index+'-icon'"
                :aria-label="index" :class="field.icon + field.iconClass"
                :style="field.styleIcon" @click="emit(`${field.actionMethode}`, $event)"/>
            <InputText :id="index" v-model="item[index]"
                       :aria-describedby="index+'-help'" :autofocus="field.autofocus"
                       :class="[{ 'min-w-full': !field.fieldNotFullWidth}, {'p-invalid': !item[index] && field.required}]"
                       :disabled="disabledAllFields || field.disabled"
                       :max="parseInt(field.maxlength)"
                       :maxlength="field.maxlength"
                       :min="parseInt(field.maxlength)"
                       :minlength="field.minlength"
                       :readonly="readOnlyAllFields || field.readonly"
                       :required="Boolean(field.required)" @focusout="emit(`${field.onFocusOut}`, $event)"/>
            <!--             <Button v-show="field.withIcon" :class="field.iconClass" :icon="field.icon" aria-label="Submit" style="position: absolute;right: 3px; top: 5px;" />-->


            <label :for="index"><required-star v-if="field.required"/>{{ field.label }}</label>
          </span>
          <div class="flex justify-content-between flex-wrap m-2">
            <small v-if="item[index]" class="fadeinleft animation-duration-200 font-light font-italic">
              {{ generals.numberOfCharacters }} {{
                item[index].length
              }}/{{ field.maxlength }}</small>
            <small :id="index+'-help'">{{ field.help }}</small>
          </div>
        </div>
      <!-- Zahlen Eingabe -->
      <div v-if="field.fieldType === 'inputNumber'" v-show="field.fieldType === 'inputNumber'" :class="field.cssClass"
           class="font-bold">
          <span class="p-float-label">
            <InputNumber :id="index" v-model="item[index]"
                         :aria-describedby="index+'-help'"
                         :autofocus="field.autofocus"
                         :class="{'p-invalid': !item[index] && field.required}"
                         :disabled="disabledAllFields || field.disabled"
                         :maxlength="field.maxlength"
                         :minlength="field.minlength"
                         :readonly="readOnlyAllFields || field.readonly"
                         :required="Boolean(field.required)" :step="parseInt(field.step)"
                         class="min-w-full" showButtons/>
            <label :for="index"><required-star v-if="field.required"/>{{ field.label }}</label>
          </span>
        <div class="flex justify-content-between flex-wrap m-2">
          <small v-if="item[index]" class="fadeinleft animation-duration-200 font-light font-italic">
            {{ generals.numberOfCharacters }} {{
              item[index].toString().length
            }}/{{ field.maxlength }}</small>
          <small :id="index+'-help'">{{ field.help }}</small>
        </div>
      </div>
      <!-- Dropdown -->
      <div v-if="field.fieldType === 'dropDown'" v-show="!field.show" :class="field.cssClass" class="font-bold">
          <span class="p-float-label">
            <!-- Mit Gruppen -->
            <Dropdown v-if="field.group" v-model="item[index]"
                      :aria-describedby="index+'-help'"
                      :autofocus="field.autofocus" :class="{'p-invalid': !item[index].id && field.required}"
                      :disabled="disabledAllFields || field.disabled"
                      :filter="true"
                      :loading="field.isLoading"
                      :optionGroupChildren="field.optionGroupChildren"
                      :optionLabel="field.optionLabel"
                      :optionValue="field.optionValue"
                      :options="field.options"
                      :readonly="readOnlyAllFields || field.readonly"
                      :required="Boolean(field.required)"
                      class="min-w-full max-w-full" optionGroupLabel="label">
              <template #optiongroup="slotProps">
                  <div class="flex align-items-center">
                       <div><h4 class="text-color font-bold m-0 p-0">{{ slotProps.option.label }}</h4></div>
                  </div>
              </template>
              <template #option="slotProps">
                  <div class="flex align-items-center">
                       <div> => {{ slotProps.option[field.optionLabel] }}</div>
                  </div>
              </template>
            </Dropdown>
            <!-- Reagieren bei Änderung -->
            <Dropdown v-else-if="field.change" :id="index"
                      v-model="item[index].id"
                      :aria-describedby="index+'-help'"
                      :autofocus="field.autofocus"
                      :class="{'p-invalid': !item[index].id && field.required}"
                      :disabled="disabledAllFields || field.disabled"
                      :loading="field.isLoading"
                      :optionLabel="field.optionLabel"
                      :optionValue="field.optionValue"
                      :options="field.options"
                      :readonly="readOnlyAllFields || field.readonly" :required="Boolean(field.required)"
                      class="min-w-full max-w-full" filter
                      @change="emit(`${field.change}`, $event)"/>
            <Dropdown v-else :id="index"
                      v-model="item[index].id"
                      :aria-describedby="index+'-help'"
                      :autofocus="field.autofocus"
                      :class="{'p-invalid': !item[index].id && field.required}"
                      :disabled="disabledAllFields || field.disabled"
                      :loading="field.isLoading"
                      :optionLabel="field.optionLabel"
                      :optionValue="field.optionValue"
                      :options="field.options"
                      :readonly="readOnlyAllFields || field.readonly" :required="Boolean(field.required)"
                      class="min-w-full max-w-full" filter />
            <label :for="index"><required-star v-if="field.required"/>{{ field.label }}</label>
          </span>
        <div class="flex justify-content-between flex-wrap m-2">
          <small></small>
          <small :id="index+'-help'">{{ field.help }}</small>
        </div>
      </div>
    </template>
    </template>

    <!-- Text Erforderliches Felder -->
    <div v-if="showRequiredText" class="col-12">
      <required-text/>
    </div>
  </div>
</template>
<script setup>
import RequiredText from "@/components/RequiredText.vue";
import RequiredStar from "@/components/RequiredStar.vue";
import {onMounted, ref, watch} from "vue";
import {useTranslationsStore} from "@/stores/translations"; // Events die abgefeuert werden

// Events die abgefeuert werden
const emit = defineEmits(
    [
        'enabledActionButton', 'changeDropDownTabArea', 'changeDropDownBookmarkCategory', 'getSiteTitle'
    ])

// Variable die auf mit von der Component erwartet werden
const props = defineProps({
  // Felder
  fields: {
    type: Object,
    required: true
  },
  // Eintrag
  item: {
    type: Object,
    required: true
  },
  // Anzeige - erforderliche Felder
  showRequiredText: {
    type: Boolean,
    required: false,
    default: true
  },
  // Alle Felder - Readonly
  readOnlyAllFields: {
    type: Boolean,
    required: false,
    default: false
  },
  // Alle Felder - disabled
  disabledAllFields: {
    type: Boolean,
    required: false,
    default: false
  },
  // Nur Lösche felder
  onlyDeleteFields: {
    type: Boolean,
    required: false,
    default: false
  },
});

// Store - Translations
const storeTranslations = useTranslationsStore();
const {components, generals} = storeTranslations;

// Erforderlichen Felder
const requiredFields = ref([]);
const requiredFieldsTrue = ref([]);

/**
 * Pflichtfelder finden
 * @returns {Promise<void>}
 */
const findRequiredFields = async () => {
  for (const [key, value] of Object.entries(props.fields)) {
    if (props.fields[key].required) {
      requiredFields.value.push(key);
    }
  }
};

/**
 * Prüfen, ob die erforderlichen Felder ausgefüllt sind
 * @returns {Promise<void>}
 */
const checkRequiredFields = () => {
  requiredFields.value.forEach(field => {
    let findField = Object.entries(props.fields).filter(element => field === element[0])

    if (findField && findField.length > 0 && findField[0].length > 0 &&
        findField[0][1].fieldType === 'dropDown' && props.item[field] &&
        props.item[field].id && props.item[field].id.length > 0
    ) {
      if (!requiredFieldsTrue.value.includes(field)) {
        requiredFieldsTrue.value.push(field);
      }
    } else if (findField && findField.length > 0 && findField[0].length > 0 &&
        findField[0][1].fieldType === 'dropDown' && props.item[field]) {
      if (Object.keys(props.item[field]).length !== 0) {
        if (!requiredFieldsTrue.value.includes(field)) {
          requiredFieldsTrue.value.push(field);
        }
      }
    } else if (props.item[field] && props.item[field].toString().length > 0) {
      if (!requiredFieldsTrue.value.includes(field)) {
        requiredFieldsTrue.value.push(field);
      }
    } else {
      requiredFieldsTrue.value = []
    }
  });
  // Wenn die Pflichtfelder nicht befüllt sind, dann den Knopf deaktivieren
  if (requiredFieldsTrue.value.length !== requiredFields.value.length) {
    emit('enabledActionButton', true);
  } else {
    emit('enabledActionButton', false);
  }
};

// Wird beim ausgeführt beim Laden der Komponente
onMounted(async () => {
  await findRequiredFields();
  await checkRequiredFields();
});

// Überwachung von den erforderlichen Feldern
watch(props, (newValue) => {
  checkRequiredFields();
});

</script>