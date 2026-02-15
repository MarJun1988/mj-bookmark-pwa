<script lang="ts" setup>
import { computed } from "vue";
import { useDashboardStore } from "@/stores/dashboard.store.ts";
import type { Item, ItemView, Tab, Tag } from "@/utils/interfaces.ts";

// Stores
const dashboardStore = useDashboardStore();

// aktuell bearbeiten
const mode = computed(() => dashboardStore.mode);

/* ======================
   Props
====================== */
const props = defineProps<{
  activeTab: Tab | null;
  item: ItemView;
}>();

/* ======================
   Emits
====================== */
const emits = defineEmits<{
  // Event ohne Parameter
  // close: []

  // Event mit einem Parameter
  openActionMenu: [event: Event, group: ItemView];
  // submit: [value: string]

  // Event mit mehreren Parametern
  // update: [id: number, name: string]
}>();

function isSkeletonItem(item: ItemView): item is Extract<ItemView, { __skeleton: true }> {
  return !!(item as any).__skeleton;
}

const realItem = computed<Item | null>(() => {
  return isSkeletonItem(props.item) ? null : (props.item as Item);
});

function getGroupTitle(groupId?: string): string {
  if (!groupId || !props.activeTab) return "";

  const group = props.activeTab.groups?.find((g) => g.id === groupId);
  return group?.title ?? "";
}

function getVisibleTags(tags: Tag[], limit = 3) {
  return tags.slice(0, limit);
}

function getHiddenTagCount(tags: Tag[], limit = 3) {
  return Math.max(tags.length - limit, 0);
}

function openInNewTab(url?: string) {
  if (!url) return;
  window.open(url, "_blank", "noopener,noreferrer");
}
</script>

<template>
  <div
    :class="mode === 'edit' ? 'ring-1 ' : ''"
    :data-item-id="props.item.id"
    class="cursor-pointer grid grid-cols-2 h-full relative rounded-xl shadow-sm transition hover:shadow-md p-2 bg-(--p-surface-ground) hover:bg-(--p-surface-hover)"
    @click="realItem?.url && openInNewTab(realItem.url)"
  >
    <!-- Header -->
    <div class="col-span-2 min-w-0">
      <!-- Title + Open Icon -->
      <div class="flex items-center gap-2 min-w-0">
        <!-- Favicon -->
        <img
          v-if="realItem?.favicon"
          :src="realItem?.favicon"
          alt=""
          class="w-4 h-4 shrink-0 rounded-sm"
        />

        <!-- Fallback -->
        <div
          v-else
          class="w-4 h-4 shrink-0 rounded-sm bg-surface-border flex items-center justify-center text-[10px] text-muted"
        >
          🌐
        </div>

        <h3 class="font-semibold truncate flex-1">
          {{ props.item.title }}
        </h3>

        <i
          v-if="mode === 'view'"
          class="pi pi-external-link shrink-0 text-sm opacity-70 hover:opacity-100 cursor-pointer"
        />
        <!-- Action Menu Trigger -->
        <div
          v-if="mode === 'edit'"
          class="col-span-1 text-right shrink-0 rounded-xl bg-primary-contrast"
        >
          <Button
            class="shrink-0 opacity-60 z-10"
            icon="pi pi-ellipsis-v"
            rounded
            size="small"
            text
            @click.stop="emits('openActionMenu', $event, props.item)"
          />
        </div>
      </div>

      <!-- URL full width -->
      <span class="text-xs block truncate mt-0.5">
        {{ realItem?.url }}
      </span>
    </div>

    <!-- Footer Tab - Gruppe -->
    <div v-if="props.activeTab" class="w-full flex flex-wrap gap-1 mt-3 text-xs col-span-2">
      {{ props.activeTab.title }} / {{ getGroupTitle(realItem?.groupId) }}
    </div>

    <!-- Tags -->
    <div v-if="realItem?.tags" class="mt-auto pt-2 flex flex-wrap gap-1 col-span-2">
      <Tag
        v-for="tag in getVisibleTags(realItem?.tags)"
        :key="tag.id"
        :value="tag.slug"
        class="px-2! py-0.5! text-xs!"
        pt:root="'border-[var(--p-surface-border)] !border-red-200'"
        severity="contrast"
      />

      <Tag
        v-if="getHiddenTagCount(realItem?.tags) > 0"
        :value="`+${getHiddenTagCount(realItem?.tags)}`"
        class="px-2! py-0.5! text-xs!"
        severity="secondary"
      />
      <!-- Keine Tags hinterlegt -->
      <div v-if="realItem?.tags.length === 0" class="h-5" />
    </div>
  </div>
</template>
