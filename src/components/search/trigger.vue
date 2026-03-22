<script setup lang="ts">
import { useSearchPalette } from "@/composables/useSearchPalette";

const { toggle } = useSearchPalette();
const { width = "fit" } = defineProps<{ width?: string }>();
</script>

<template>
  <button
    @click="toggle"
    class="search-trigger flex items-center justify-between"
    :class="
      width === 'full'
        ? 'w-full transition-all! duration-250! hover:cursor-text! hover:scale-110 shadow-md shadow-transparent hover:shadow-neutral-300 hover:font-semibold'
        : 'w-fit'
    "
    aria-label="Search"
  >
    <div class="flex items-center gap-1">
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
      <span>Search</span>
    </div>
    <kbd>⌘K</kbd>
  </button>
</template>

<style scoped>
.search-trigger {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  font-size: 14px;
  color: #6b7280;
  transition:
    border-color 0.15s,
    color 0.15s;
}
.search-trigger:hover {
  border-color: #d1d5db;
  color: #374151;
}
.search-trigger kbd {
  margin-left: 4px;
  padding: 1px 5px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  font-size: 11px;
  font-family: inherit;
  background: #f9fafb;
}
</style>
