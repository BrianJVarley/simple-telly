<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { FunnelIcon } from '@heroicons/vue/24/outline'
const props = withDefaults(
  defineProps<{
    genres: string[]
  }>(),
  {
    genres: () => [],
  },
)

const filterBtnRef = ref<HTMLElement | null>(null)

const emit = defineEmits<{
  filterApplied: [genreFilter: string]
}>()

const isMenuOpen = ref(false)

const menuGenres = computed(() => {
  const uniqueGenres = new Set(props.genres.filter(Boolean))
  return ['All', ...uniqueGenres]
})

function onFilterApplied(genreFilter: string) {
  if (!genreFilter) {
    return
  }

  emit('filterApplied', genreFilter)
  isMenuOpen.value = false
  nextTick(() => filterBtnRef.value?.focus())
}

function onEscapeKey(event: KeyboardEvent) {
  if (event.key === 'Escape' && isMenuOpen.value) {
    isMenuOpen.value = false
    nextTick(() => filterBtnRef.value?.focus())
  }
}

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
}
</script>

<template>
  <div class="search-filter-container">
    <div class="filter-menu">
      <button
        type="button"
        ref="filterBtnRef"
        class="filter-trigger"
        aria-haspopup="menu"
        :aria-expanded="isMenuOpen"
        aria-label="Filter shows by genre"
        @click="toggleMenu"
        v-tooltip="{ text: 'Filter by Genre', placement: 'right' }"
      >
        <FunnelIcon class="filter-icon" aria-hidden="true" />
        Genre
      </button>

      <ul
        v-if="isMenuOpen"
        class="filter-dropdown"
        role="menu"
        aria-label="Select genre filter"
        @keydown="onEscapeKey($event)"
      >
        <li
          v-memo="[genres]"
          v-for="genre in menuGenres"
          :key="genre"
          role="none"
        >
          <button
            type="button"
            :aria-label="`${genre} shows`"
            class="filter-option"
            role="menuitem"
            @click="onFilterApplied(genre)"
          >
            {{ genre }}
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.search-filter-container {
  background-color: var(--color-background-soft);
}

.filter-menu {
  position: relative;
}

.filter-trigger {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  padding: 0.5rem 0.75rem;
  background-color: var(--color-background-soft);
  color: var(--color-text);
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.filter-trigger:hover {
  border-color: var(--color-border-hover);
}

.filter-icon {
  display: block;
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
  stroke: currentColor;
}

.filter-dropdown {
  position: absolute;
  right: 0;
  z-index: 40;
  margin-top: 0.4rem;
  min-width: 10rem;
  list-style: none;
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  padding: 0.25rem;
  background-color: var(--color-background-soft);
  box-shadow: 0 8px 20px rgb(0 0 0 / 12%);
}

.filter-option {
  width: 100%;
  border: 0;
  border-radius: 0.35rem;
  padding: 0.45rem 0.6rem;
  text-align: left;
  color: var(--color-text);
  background-color: transparent;
  cursor: pointer;
}

.filter-option:hover {
  background-color: var(--color-background-mute);
}
</style>
