<script setup lang="ts">
import { computed } from 'vue'
import { useVirtualList } from '@vueuse/core'
import type { Show } from '@/types/tvShowModel'
import { ApiErrorTypes } from '@/types/apiErrorModel'
import ApiError from './ApiError.vue'
const props = defineProps<{
  shows: Show[]
  isLoading: boolean
  error: { message: string; cause?: keyof typeof ApiErrorTypes | undefined } | null
}>()

const emit = defineEmits<{
  select: [showId: number]
  goToFirstPage: []
  refresh: []
}>()

const { list, containerProps, wrapperProps } = useVirtualList(
  computed(() => props.shows),
  {
    itemHeight: 120,
  },
)
</script>

<template>
  <div
    v-bind="containerProps"
    class="flex-1 overflow-y-auto p-4"
    role="region"
    aria-label="Today's schedule"
  >
    <div v-if="isLoading && !shows.length" class="text-gray-400 text-sm p-4" aria-busy="true">
      Loading schedule...
    </div>
    <ApiError
      v-else-if="error && !shows.length"
      :message="error.message"
      :cause="error.cause"
      @retry="emit('refresh')"
      @back-to-home="emit('goToFirstPage')"
    />
    <template v-else>
      <div v-bind="wrapperProps" role="list" :aria-busy="isLoading">
        <div
          v-for="{ data: show } in list"
          :key="show.id"
          :data-show-id="show.id"
          role="listitem"
          :aria-label="show.name"
          tabindex="0"
          @click="emit('select', show.id)"
          @keydown.enter.prevent="emit('select', show.id)"
          @keydown.space.prevent="emit('select', show.id)"
          class="flex items-center gap-4 py-2 border-b border-gray-800 hover:bg-gray-800 rounded px-2 cursor-pointer"
        >
          <img
            :src="show.image?.medium"
            :alt="show.name"
            class="show-image w-12 h-16 object-cover rounded flex-shrink-0"
          />
          <div class="min-w-0">
            <p class="font-medium truncate">{{ show.name }}</p>
            <p class="text-xs text-gray-400 truncate">
              {{ show.genres?.join(', ') ?? 'Unknown Genre' }}
            </p>
            <p class="text-xs text-gray-400 truncate">
              Rating {{ show.rating.average ?? 'N/A' }}
              <span
                v-tooltip="'Top rated show'"
                v-if="(show.rating?.average ?? 0) >= 7.5"
                aria-label="Top rated"
                >⭐</span
              >
            </p>
          </div>
        </div>
      </div>
      <div
        v-if="isLoading && shows.length"
        class="px-4 py-2 text-xs text-gray-400"
        role="status"
        aria-live="polite"
        aria-atomic="true"
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
    </template>
  </div>
</template>
