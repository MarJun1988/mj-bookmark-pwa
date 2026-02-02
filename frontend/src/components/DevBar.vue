<script lang="ts" setup></script>

<template>
  <!-- 🧭 Dev Breakpoint Indicator -->
  <div
    class="fixed bottom-0 left-0 z-50 w-full text-center font-mono text-sm text-white shadow-md"
  >
    <!-- xs -->
    <div class="bg-red-600 sm:hidden">
      📱 <strong>xs</strong> (&lt;640px) — Smartphones (Portrait)
    </div>

    <!-- sm -->
    <div class="hidden bg-orange-500 sm:block md:hidden">
      📱 <strong>sm</strong> (≥640px) — Smartphones (Landscape) / kleine Tablets
    </div>

    <!-- md -->
    <div class="hidden bg-yellow-500 md:block lg:hidden">
      💻 <strong>md</strong> (≥768px) — Tablets (Portrait)
    </div>

    <!-- lg -->
    <div class="hidden bg-green-600 lg:block xl:hidden">
      🖥️ <strong>lg</strong> (≥1024px) — Tablets (Landscape) / kleine Laptops
    </div>

    <!-- xl -->
    <div class="hidden bg-blue-600 xl:block 2xl:hidden">
      🖥️ <strong>xl</strong> (≥1280px) — Laptops / Desktop (Full HD)
    </div>

    <!-- 2xl (angepasst) -->
    <div class="hidden bg-purple-600 2xl:block 3xl:hidden">
      🧠 <strong>2xl</strong> (≥1700px) — Große Desktops / WQHD
    </div>

    <!-- 3xl -->
    <div class="hidden bg-fuchsia-700 3xl:block">
      🖥️🧠 <strong>3xl</strong> (≥2100px) — 4K / Ultrawide
    </div>
  </div>
</template>
