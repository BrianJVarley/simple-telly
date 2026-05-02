<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useHorizontalScroll } from '@/composables/useHorizontalScroll'
import { useShowNavigation } from '@/composables/useShowNavigation'
import type { Show } from '@/types/tvShowModel'

defineProps<{ genre: string; shows: Show[] }>()

const router = useRouter()
const { captureBeforeNavigate } = useShowNavigation()
const hScrollContainer = ref<HTMLElement | null>(null)
const { canScrollLeft, canScrollRight, scrollLeft, scrollRight } =
  useHorizontalScroll(hScrollContainer)

function navigateToShowDetails(showId: number) {
  captureBeforeNavigate(showId)
  router.push({ name: 'show-details', params: { id: showId }, query: {} })
}
</script>

<template>
  <div class="genre-row-shell pb-4 pr-4 pl-4">
    <h2
      id="genreHeader"
      class="genre-row-title text-sm pb-2 font-semibold uppercase tracking-wider px-4 pt-3 pb-1"
    >
      {{ genre }}
    </h2>
    <div aria-labelledby="genreHeader" class="flex items-center gap-1">
      <button
        @click="scrollLeft"
        :disabled="!canScrollLeft"
        :aria-label="`Scroll ${genre} left`"
        class="genre-nav-btn flex-shrink-0 text-2xl px-2 transition-colors"
        :class="canScrollLeft ? 'genre-nav-btn-enabled' : 'genre-nav-btn-disabled cursor-default'"
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
          v-memo="[show.id, show.name, show.rating.average, show.image?.medium]"
          :data-show-id="show.id"
          role="listitem"
          :aria-label="show.name"
          tabindex="0"
          @click="navigateToShowDetails(show.id)"
          @keydown.enter.prevent="navigateToShowDetails(show.id)"
          @keydown.space.prevent="navigateToShowDetails(show.id)"
          class="flex-shrink-0 w-24 mt-1 mb-1 cursor-pointer hover:scale-105 transition-transform"
        >
          <img
            :src="show?.image?.medium ?? '/images/show-placeholder-404.svg'"
            :alt="show.name"
            loading="lazy"
            class="w-full h-32 object-cover rounded-lg"
          />
          <div class="min-w-0 px-0.5 pb-1">
            <p class="text-xs font-medium truncate mt-1">{{ show.name }}</p>
            <p class="genre-rating text-xs truncate">
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
        class="genre-nav-btn flex-shrink-0 text-2xl px-2 transition-colors"
        :class="canScrollRight ? 'genre-nav-btn-enabled' : 'genre-nav-btn-disabled cursor-default'"
      >
        ›
      </button>
    </div>
  </div>
</template>

<style scoped>
.genre-row-shell {
  background-color: var(--color-background-soft);
}

.genre-row-title,
.genre-rating {
  color: var(--color-text-muted);
}

.genre-nav-btn-enabled {
  color: var(--color-text-muted);
}

.genre-nav-btn-enabled:hover {
  color: var(--color-text);
}

.genre-nav-btn-disabled {
  color: var(--color-border-hover);
}
</style>
