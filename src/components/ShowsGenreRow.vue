<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useHorizontalScroll } from '@/composables/useHorizontalScroll'
import type { Show } from '@/types/tvShowModel'

defineProps<{ genre: string; shows: Show[] }>()
const emit = defineEmits<{
  loadNextPage: []
  loadPreviousPage: []
}>()

const router = useRouter()
const hScrollContainer = ref<HTMLElement | null>(null)
const { canScrollLeft, canScrollRight, scrollLeft, scrollRight } =
  useHorizontalScroll(hScrollContainer)

watch(canScrollRight, (can) => {
  if (!can) emit('loadNextPage')
})

watch(canScrollLeft, (can, prev) => {
  if (!can && prev) emit('loadPreviousPage')
})

function navigateToShowDetails(showId: number) {
  router.push({ name: 'show-details', params: { id: showId } })
}
</script>

<template>
  <div class="bg-gray-900 pb-4 pr-4 pl-4">
    <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wider px-4 pt-3 pb-1">
      {{ genre }}
    </h2>
    <div class="flex items-center gap-1">
      <button
        @click="scrollLeft"
        :disabled="!canScrollLeft"
        :aria-label="`Scroll ${genre} left`"
        class="flex-shrink-0 text-2xl px-2 transition-colors"
        :class="canScrollLeft ? 'text-gray-400 hover:text-white' : 'text-gray-700 cursor-default'"
      >
        ‹
      </button>
      <div
        ref="hScrollContainer"
        role="list"
        :aria-label="`${genre} shows`"
        class="flex flex-row flex-nowrap flex-1 overflow-x-auto gap-1"
        style="scrollbar-width: none"
      >
        <div
          v-for="show in shows"
          :key="show.id"
          role="listitem"
          :aria-label="show.name"
          tabindex="0"
          @click="navigateToShowDetails(show.id)"
          @keydown.enter="navigateToShowDetails(show.id)"
          class="flex-shrink-0 w-24 cursor-pointer hover:scale-105 transition-transform"
        >
          <img
            :src="show.image?.medium"
            :alt="show.name"
            class="w-full h-32 object-cover rounded-lg"
          />
          <div class="min-w-0 px-0.5">
            <p class="text-xs font-medium truncate mt-1">{{ show.name }}</p>
            <p class="text-xs text-gray-400 truncate">
              {{ show.rating.average ?? '—' }}
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
      <button
        @click="scrollRight"
        :disabled="!canScrollRight"
        :aria-label="`Scroll ${genre} right`"
        class="flex-shrink-0 text-2xl px-2 transition-colors"
        :class="canScrollRight ? 'text-gray-400 hover:text-white' : 'text-gray-700 cursor-default'"
      >
        ›
      </button>
    </div>
  </div>
</template>
