<script setup lang="ts">
import ShowsGenreRow from './ShowsGenreRow.vue'
import ApiError from '../ErrorHandling/ApiError.vue'
import { PaginationWidget as Pagination } from '@simple-telly/ui'
import { useHomeState } from './HomeContext.ts'

/**
 * Alternative approach to provide state to child components using injection keys
 * Using type injection keys to provide state to child
 * components without prop drilling
 */
const state = useHomeState()

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
      v-if="state.listLoading && !state.showsByGenre.size"
      class="text-sm px-4 py-3"
      :style="{ color: 'var(--color-text-muted)' }"
      aria-busy="true"
    >
      Loading shows...
    </div>
    <ApiError
      v-else-if="state.listError && !state.showsByGenre.size"
      :message="state.listError.message"
      :cause="state.listError.cause"
      @retry="emit('refresh')"
      @back-to-home="emit('goToFirstPage')"
    />
    <template v-else>
      +
      <div v-if="!state.results.length" class="relative" :aria-busy="state.listLoading">
        <div
          v-if="state.listLoading"
          class="px-4 py-2 text-xs"
          :style="{ color: 'var(--color-text-muted)' }"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          Loading shows...
        </div>
        <ShowsGenreRow
          v-for="[genre, genreShows] in state.showsByGenre"
          v-memo="[genre, genreShows]"
          :key="genre"
          :genre="genre"
          :shows="genreShows"
        />
      </div>
      <Pagination
        v-if="!state.results.length"
        :currentPage="state.currentPage + 1"
        :disableNext="state.showsByGenre?.size === 0"
        @previousPage="emit('previousPage')"
        @skip-backward="(value) => emit('skipBackward', value)"
        @skip-forward="(value) => emit('skipForward', value)"
        @nextPage="emit('nextPage')"
      />
      <ApiError
        v-if="state.listError && !state.showsByGenre.size"
        :message="state.listError?.message"
        :cause="state.listError?.cause"
        @retry="emit('refresh')"
      />
    </template>
  </div>
</template>
