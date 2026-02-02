<template>
    <required-star/>
    <span>{{ generals.requiredFieldText }}</span>
</template>
<script setup>
import RequiredStar from "@/components/RequiredStar.vue";
import {useTranslationsStore} from "@/stores/translations";

// Store - Translations
const storeTranslations = useTranslationsStore();
const {generals} = storeTranslations;
</script>

<style scoped>

</style>