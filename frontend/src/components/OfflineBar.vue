<template>
  <div
    v-if="!networkStore.online"
    class="fixed bottom-0 left-0 z-50 w-full inset-x-0 bg-red-600 text-white text-center py-2"
  >
    🔌 Du bist offline
  </div>
  <!--  <div-->
  <!--    v-else-->
  <!--    class="fixed bottom-0 left-0 z-50 w-full inset-x-0 bg-green-600 text-white text-center py-2"-->
  <!--  >-->
  <!--    🔌 Du bist online-->
  <!--  </div>-->
</template>

<script lang="ts" setup>
import {useNetworkStore} from '@/stores/network.store'

const networkStore = useNetworkStore()
</script>