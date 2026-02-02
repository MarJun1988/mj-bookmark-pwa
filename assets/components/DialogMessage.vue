<template>
  <div v-if="result.status === 403 || (result.errors && result.errors.length > 0)" class="col-12 font-bold text-center mt-5">
    <Message v-if="result.errors && result.errors[0].message" severity="error">{{ result.errors[0].message }}</Message>
    <Message v-else severity="error">{{ result.message }}</Message>
  </div>
</template>
<script setup>
// Entity-Store
import {storeToRefs} from "pinia";
import {useEntityStore} from "@/stores/entity";

const storeEntity = useEntityStore();
const {result} = storeToRefs(storeEntity)
</script>
