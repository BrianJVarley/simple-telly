<script setup lang="ts">
import ShowsGenreRow from './ShowsGenreRow.vue'
import ApiError from '../ErrorHandling/ApiError.vue'
import { PaginationWidget as Pagination } from '@simple-telly/ui'
import type { Show } from '@/types/tvShowModel'
import type { ApiErrorTypes } from '@/types/apiErrorModel'

defineProps<{
  showsSortedByGenre: Map<string, Show[]>
  shows: Show[]
  isLoading: boolean
  error: { message: string; cause?: keyof typeof ApiErrorTypes | undefined } | null
  currentPage: number
  hasSearchResults: boolean
}>()

const emit = defineEmits<{
  refresh: []
  goToFirstPage: []
  nextPage: []
  previousPage: []
  skipBackward: [value: number]
  skipForward: [value: number]
}>()
</script>

<template>
  <div role="region" aria-label="Featured shows by genre">
    <div
      v-if="isLoading && !shows.length"
      class="text-sm px-4 py-3"
      :style="{ color: 'var(--color-text-muted)' }"
      aria-busy="true"
    >
      Loading shows...
    </div>
    <ApiError
      v-else-if="error && !shows.length"
      :message="error.message"
      :cause="error.cause"
      @retry="emit('refresh')"
      @back-to-home="emit('goToFirstPage')"
    />
    <template v-else>
      <div v-if="!hasSearchResults" class="relative" :aria-busy="isLoading">
        <div
          v-if="isLoading"
          class="px-4 py-2 text-xs"
          :style="{ color: 'var(--color-text-muted)' }"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          Loading shows...
        </div>
        <ShowsGenreRow
          v-for="[genre, genreShows] in showsSortedByGenre"
          :key="genre"
          :genre="genre"
          :shows="genreShows"
        />
      </div>
      <Pagination
        v-if="!hasSearchResults"
        :currentPage="currentPage"
        :disableNext="!shows.length"
        @previousPage="emit('previousPage')"
        @skip-backward="(value) => emit('skipBackward', value)"
        @skip-forward="(value) => emit('skipForward', value)"
        @nextPage="emit('nextPage')"
      />
      <ApiError
        v-if="error && shows.length"
        :message="error.message"
        :cause="error.cause"
        @retry="emit('refresh')"
      />
    </template>
  </div>
</template>
