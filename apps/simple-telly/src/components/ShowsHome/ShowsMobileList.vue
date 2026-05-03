<script setup lang="ts">
import { computed } from 'vue'
import { ApiErrorTypes } from '@/types/apiErrorModel'
import { SHOW_PLACEHOLDER_IMAGE } from '@/constants/images'
import ApiError from '../ErrorHandling/ApiError.vue'
import type { Show, ShowsByGenre } from '@/types/tvShowModel'

const props = defineProps<{
  shows: ShowsByGenre
  isLoading: boolean
  totalShows: number
  error: { message: string; cause?: keyof typeof ApiErrorTypes | undefined } | null
}>()

const emit = defineEmits<{
  select: [showId: number]
  goToFirstPage: []
  refresh: []
  nextPage: []
}>()

type MobileRow =
  | { type: 'genre'; key: string; genre: string }
  | { type: 'show'; key: string; genre: string; show: Show }

const genreEntries = computed<[string, Show[]][]>(() => Array.from(props.shows.entries()))

/**
 * Flattens the shows grouped by genre into a single list of rows for mobile template
 */
const rows = computed<MobileRow[]>(() => {
  const result: MobileRow[] = []

  for (const [genre, shows] of genreEntries.value) {
    result.push({ type: 'genre', key: `genre-${genre}`, genre })

    for (const show of shows) {
      result.push({ type: 'show', key: `show-${genre}-${show.id}`, genre, show })
    }
  }

  return result
})

function onScroll(event: Event) {
  const el = event.target as HTMLElement
  const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 100

  if (nearBottom && !props.isLoading) {
    emit('nextPage')
  }
}
</script>

<template>
  <div
    class="flex-1 overflow-y-auto p-4 h-full max-h-screen"
    role="region"
    aria-label="TV Shows schedule"
    @scroll="onScroll"
  >
    <div v-if="isLoading && !totalShows" class="text-gray-400 text-sm p-4" aria-busy="true">
      Loading schedule...
    </div>
    <ApiError
      v-else-if="error && !totalShows"
      :message="error.message"
      :cause="error.cause"
      @retry="emit('refresh')"
      @back-to-home="emit('goToFirstPage')"
    />
    <template v-else>
      <div role="list" :aria-busy="isLoading">
        <div v-for="row in rows" :key="row.key">
          <div
            v-if="row.type === 'genre'"
            class="sticky top-0 z-10 py-2"
            role="heading"
            aria-level="2"
          >
            <span class="info-chip">{{ row.genre }}</span>
          </div>

          <div
            v-else
            :data-show-id="row.show.id"
            role="listitem"
            :aria-label="row.show.name"
            tabindex="0"
            @click="emit('select', row.show.id)"
            @keydown.enter.prevent="emit('select', row.show.id)"
            @keydown.space.prevent="emit('select', row.show.id)"
            class="flex items-center gap-4 py-2 border-b border-gray-800 hover:bg-gray-800 rounded px-2 cursor-pointer"
          >
            <img
              :src="row.show?.image?.medium ?? SHOW_PLACEHOLDER_IMAGE"
              :alt="row.show.name"
              loading="lazy"
              fetchpriority="low"
              decoding="async"
              class="show-image w-12 h-16 object-cover rounded flex-shrink-0"
            />
            <div class="min-w-0">
              <p class="font-medium truncate">{{ row.show.name }}</p>
              <p class="text-xs text-gray-400 truncate">
                {{ row.show.genres?.join(', ') ?? 'Unknown Genre' }}
              </p>
              <p class="text-xs text-gray-400 truncate">
                Rating {{ row.show.rating.average ?? 'N/A' }}
                <span
                  v-tooltip="'Top rated show'"
                  v-if="(row.show.rating?.average ?? 0) >= 7.5"
                  aria-label="Top rated"
                  >⭐</span
                >
              </p>
            </div>
          </div>
        </div>
      </div>
      <div
        v-if="isLoading && totalShows"
        class="px-4 py-2 text-xs text-gray-400"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        Loading shows...
      </div>
      <ApiError
        v-else-if="error && !totalShows"
        :message="error.message"
        :cause="error.cause"
        @retry="emit('refresh')"
        @back-to-home="emit('goToFirstPage')"
      />
    </template>
  </div>
</template>
