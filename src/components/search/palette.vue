<script setup lang="ts">
import {
  ref,
  computed,
  onMounted,
  onUnmounted,
  nextTick,
  watch,
  shallowRef,
} from "vue";
import Fuse from "fuse.js";
import { useSearchPalette } from "@/composables/useSearchPalette";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Post {
  slug: string;
  title: string;
  description: string;
  pubDate: string;
}

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

const { open, toggle } = useSearchPalette();
const query = ref("");
const inputRef = ref<HTMLInputElement | null>(null);
const selectedIndex = ref(0);

const fuse = shallowRef<Fuse<Post> | null>(null);

const results = computed(() => {
  if (!fuse.value || !query.value.trim()) return [];
  return fuse.value.search(query.value).slice(0, 8);
});

// Reset selection when results change
watch(results, () => {
  selectedIndex.value = 0;
});

// ---------------------------------------------------------------------------
// Index loading
// ---------------------------------------------------------------------------

onMounted(async () => {
  const res = await fetch("/api/search");
  const posts: Post[] = await res.json();

  fuse.value = new Fuse(posts, {
    keys: [
      { name: "title", weight: 2 }, // title matches rank higher
      { name: "description", weight: 1 },
    ],
    threshold: 5,
    includeScore: true,
    minMatchCharLength: 2,
    ignoreLocation: true,
  });
});

// ---------------------------------------------------------------------------
// Open / close
// ---------------------------------------------------------------------------

const { isOpen, close } = useSearchPalette();

// ---------------------------------------------------------------------------
// Keyboard shortcuts
// ---------------------------------------------------------------------------

function onKeydown(e: KeyboardEvent) {
  // ⌘+K or Ctrl+K to open
  if ((e.metaKey || e.ctrlKey) && e.key === "k") {
    e.preventDefault();
    toggle();
    return;
  }

  if (!isOpen.value) return;

  if (e.key === "Escape") {
    close();
  } else if (e.key === "ArrowDown") {
    e.preventDefault();
    selectedIndex.value = Math.min(
      selectedIndex.value + 1,
      results.value.length - 1,
    );
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    selectedIndex.value = Math.max(selectedIndex.value - 1, 0);
  } else if (e.key === "Enter" && results.value.length > 0) {
    navigate(results.value[selectedIndex.value].item.slug);
  }
}

onMounted(() => window.addEventListener("keydown", onKeydown));
onUnmounted(() => window.removeEventListener("keydown", onKeydown));

const { width = "fit" } = defineProps<{ width?: string }>();

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------

function navigate(slug: string) {
  close();
  window.location.href = slug;
}
</script>

<template>
  <!-- Trigger button (can be placed in your navbar) -->
  <button
    @click="open"
    class="search-trigger flex items-center justify-between"
    :class="width === 'full' ? 'w-full' : 'w-fit'"
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

  <!-- Backdrop -->
  <Teleport to="body">
    <div v-if="isOpen" class="palette-backdrop" @click="close">
      <!-- Modal -->
      <div class="palette" role="dialog" aria-modal="true" @click.stop>
        <!-- Input -->
        <div class="palette-input-row">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            class="palette-icon"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            ref="inputRef"
            v-model="query"
            type="text"
            placeholder="Search articles..."
            class="palette-input"
            autocomplete="off"
            spellcheck="false"
          />
          <kbd class="palette-esc" @click="close">Esc</kbd>
        </div>

        <!-- Results -->
        <ul v-if="results.length > 0" class="palette-results" role="listbox">
          <li
            v-for="(result, i) in results"
            :key="result.item.slug"
            class="palette-result"
            :class="{ 'is-selected': i === selectedIndex }"
            role="option"
            :aria-selected="i === selectedIndex"
            @mouseenter="selectedIndex = i"
            @click="navigate(result.item.slug)"
          >
            <span class="result-title">{{ result.item.title }}</span>
            <span class="result-description">{{
              result.item.description
            }}</span>
          </li>
        </ul>

        <!-- Empty state -->
        <div v-else-if="query.trim().length >= 2" class="palette-empty">
          No results for <strong>{{ query }}</strong>
        </div>

        <!-- Idle state -->
        <div v-else class="palette-idle">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            opacity="0.3"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <span>Start typing to search</span>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
/* Trigger button */
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

/* Backdrop */
.palette-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(2px);
  z-index: 9999;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 15vh;
}

/* Modal */
.palette {
  width: 100%;
  max-width: 560px;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  margin: 0 16px;
}

/* Input row */
.palette-input-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  border-bottom: 1px solid #f3f4f6;
}
.palette-icon {
  flex-shrink: 0;
  color: #9ca3af;
}
.palette-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 16px;
  background: transparent;
  color: #111827;
}
.palette-input::placeholder {
  color: #9ca3af;
}
.palette-esc {
  padding: 2px 6px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  font-size: 11px;
  color: #9ca3af;
  background: #f9fafb;
  cursor: pointer;
  flex-shrink: 0;
  font-family: inherit;
}

/* Results list */
.palette-results {
  list-style: none;
  margin: 0;
  padding: 6px;
  max-height: 380px;
  overflow-y: auto;
}
.palette-result {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.1s;
}
.palette-result.is-selected {
  background: #f3f4f6;
}
.result-title {
  font-size: 14px;
  font-weight: 500;
  color: #111827;
}
.result-description {
  font-size: 12px;
  color: #6b7280;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Empty / idle states */
.palette-empty,
.palette-idle {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 40px 16px;
  font-size: 14px;
  color: #9ca3af;
  text-align: center;
}
.palette-empty strong {
  color: #374151;
}
</style>
