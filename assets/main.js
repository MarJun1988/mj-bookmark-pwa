import {createApp} from 'vue'
import {createPinia} from 'pinia'
import PrimeVue from 'primevue/config';

import App from './App.vue'
import router from './router'

import de from './localization/de.json'

import 'primevue/resources/themes/lara-dark-amber/theme.css'
import '../node_modules/primeflex/primeflex.css';
import 'primeicons/primeicons.css'

import Tooltip from 'primevue/tooltip';

import Button from 'primevue/button';
import Card from 'primevue/card';
import Listbox from 'primevue/listbox';
import Sidebar from 'primevue/sidebar';
import TabMenu from 'primevue/tabmenu';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import ColumnGroup from 'primevue/columngroup'; // optional
import Row from 'primevue/row'; // optional
import InputSwitch from 'primevue/inputswitch';
import InputText from 'primevue/inputtext';
import InputMask from 'primevue/inputmask';
import InputNumber from 'primevue/inputnumber';
import Toast from 'primevue/toast';
import ToastService from 'primevue/toastservice';
import Dropdown from 'primevue/dropdown';
import MultiSelect from 'primevue/multiselect';
import Calendar from 'primevue/calendar';
import TriStateCheckbox from 'primevue/tristatecheckbox';
import Checkbox from 'primevue/checkbox';
import ProgressSpinner from 'primevue/progressspinner';
import ProgressBar from 'primevue/progressbar';
import Dialog from 'primevue/dialog';
import ToggleButton from 'primevue/togglebutton';
import Message from 'primevue/message';

const app = createApp(App)

app
    .directive('tooltip', Tooltip)

    .component('Button', Button)
    .component('Card', Card)
    .component('Listbox', Listbox)
    .component('Sidebar', Sidebar)
    .component('TabMenu', TabMenu)
    .component('TabView', TabView)
    .component('TabPanel', TabPanel)
    .component('Toast', Toast)
    .component('DataTable', DataTable)
    .component('Column', Column)
    .component('ColumnGroup', ColumnGroup)
    .component('Row', Row)
    .component('InputMask', InputMask)
    .component('InputNumber', InputNumber)
    .component('InputSwitch', InputSwitch)
    .component('InputText', InputText)
    .component('Dropdown', Dropdown)
    .component('MultiSelect', MultiSelect)
    .component('Calendar', Calendar)
    .component('TriStateCheckbox', TriStateCheckbox)
    .component('Checkbox', Checkbox)
    .component('ProgressSpinner', ProgressSpinner)
    .component('ProgressBar', ProgressBar)
    .component('Dialog', Dialog)
    .component('ToggleButton', ToggleButton)
    .component('Message', Message)

    .use(createPinia())
    .use(router)
    .use(PrimeVue, {ripple: true, locale: de.de})
    .use(ToastService)
    .mount('#app')
