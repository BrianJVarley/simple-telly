<script setup lang="ts">
import { MagnifyingGlassCircleIcon } from '@heroicons/vue/24/outline'
import { computed, nextTick, ref } from 'vue'

const props = defineProps<{
  query: string
}>()

const emit = defineEmits<{
  'update:query': [value: string]
  clear: []
}>()

const isSearchVisible = ref(false)
const searchInput = ref<HTMLInputElement | null>(null)

const inputValue = computed({
  get: () => props.query,
  set: (value: string) => emit('update:query', value),
})

function toggleSearch() {
  isSearchVisible.value = !isSearchVisible.value
}

function onClear() {
  emit('update:query', '')
  emit('clear')
  nextTick(() => searchInput.value?.focus())
}
</script>
<template>
  <div
    class="search-shell flex flex-row items-center gap-2 px-2 py-3 pl-4"
    role="region"
    aria-label="Featured shows"
  >
    <button type="button" @click="toggleSearch" aria-label="Toggle search">
      <MagnifyingGlassCircleIcon
        class="search-icon ml-4 w-6 h-6"
        v-tooltip="{ text: 'Search for Shows', placement: 'right' }"
      />
    </button>
    <Transition name="fade">
      <div
        v-if="isSearchVisible"
        class="search-panel min-h-[61px] border-t p-3 flex items-center gap-3"
        role="search"
      >
        <label for="show-search" class="sr-only">Search shows</label>
        <input
          ref="searchInput"
          id="show-search"
          v-model="inputValue"
          type="search"
          placeholder="Search shows..."
          autocomplete="off"
          class="search-input flex-1 rounded-full px-4 py-2 text-sm outline-none"
        />
        <button
          v-if="query"
          @click="onClear"
          aria-label="Clear search"
          class="search-clear-btn transition-colors text-sm px-3"
        >
          Clear
        </button>
      </div>
    </Transition>
  </div>
</template>
<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.search-shell {
  background-color: var(--color-background-soft);
}

.search-icon,
.search-clear-btn {
  color: var(--color-text-muted);
}

.search-clear-btn:hover,
.search-icon:hover {
  color: var(--color-text);
}

.search-panel {
  background-color: var(--color-background-soft);
  border-color: var(--color-border);
}

.search-input {
  background-color: var(--color-background-mute);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.search-input::placeholder {
  color: var(--color-text-muted);
}

.search-input:focus {
  border-color: var(--color-link);
}
</style>
