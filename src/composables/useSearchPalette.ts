import { ref } from "vue";

// Module-level state — shared across all component instances
const isOpen = ref(false);

export function useSearchPalette() {
  function open() {
    isOpen.value = true;
  }
  function close() {
    isOpen.value = false;
  }
  function toggle() {
    isOpen.value = !isOpen.value;
  }

  return { isOpen, open, close, toggle };
}
