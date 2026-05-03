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
    class="search-shell flex flex-wrap items-center gap-3 px-4 py-3 pl-8"
    role="region"
    aria-label="Featured shows"
  >
    <button
      type="button"
      @click="toggleSearch"
      aria-label="Toggle search"
      class="flex items-center rounded-full"
    >
      <MagnifyingGlassCircleIcon
        data-testid="search-icon-desktop"
        class="search-icon hidden h-10 w-10 sm:block"
        v-tooltip="{ text: 'Search for Shows', placement: 'right' }"
      />
      <MagnifyingGlassCircleIcon
        data-testid="search-icon-mobile"
        class="search-icon h-12 w-12 sm:hidden"
        v-tooltip="{ text: 'Search for Shows', placement: 'right' }"
      />
    </button>
    <Transition name="fade">
      <div
        v-if="isSearchVisible"
        class="search-panel flex min-h-[61px] min-w-0 flex-1 items-center gap-3 p-3"
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

.search-shell button {
  flex-shrink: 0;
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
  margin-right: 1rem;
}

.search-input::placeholder {
  color: var(--color-text-muted);
}

.search-input:focus {
  border-color: var(--color-link);
}
</style>
