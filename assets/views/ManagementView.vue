<template>
  <!-- Anzeige der Sites -->
  <div class="grid grid-nogutter">
    <div class="col-12">
      <router-view></router-view>
      <!-- Tabellen -->
      <router-view name="tableView"></router-view>
      <!-- Dialog -->
      <router-view name="dialogView"></router-view>
    </div>

  </div>
</template>

<script setup></script>

<style scoped>

</style>