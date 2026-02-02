<script lang="ts" setup>
import {useRouter} from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}
</script>

<template>
  <div
    class="h-full flex items-center justify-center bg-[var(--p-surface-section)]"
  >
    <div class="text-center max-w-md space-y-6">
      <!-- 404 -->
      <div class="relative">
        <h1
          class="text-[6rem] font-bold leading-none
                 text-surface-300 dark:text-surface-700"
        >
          404
        </h1>
      </div>

      <!-- Text -->
      <div class="space-y-2">
        <h2 class="text-2xl font-semibold">
          Seite nicht gefunden
        </h2>
        <p>
          Diese Seite existiert nicht oder wurde verschoben.
        </p>
      </div>

      <!-- Actions -->
      <div class="flex justify-center gap-3 pt-2">
        <Button
          icon="pi pi-home"
          label="Zur Übersicht"
          severity="primary"
          @click="goHome"
        />

        <Button
          icon="pi pi-arrow-left"
          label="Zurück"
          outlined
          severity="secondary"
          @click="router.back()"
        />
      </div>
    </div>
  </div>
</template>
