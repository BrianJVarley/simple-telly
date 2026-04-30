<script setup lang="ts">
import { useShowList } from '@/composables/useShowList'
import { useShowSearch } from '@/composables/useShowSearch'
import ShowsGenreRow from '@/components/ShowsGenreRow.vue'
import ApiError from '@/components/ApiError.vue'
import { ref, watch } from 'vue'
import { useVirtualList } from '@vueuse/core'
import { useRouter, useRoute } from 'vue-router'
import { MagnifyingGlassCircleIcon } from '@heroicons/vue/24/outline'
import { useBreakpoints, breakpointsTailwind } from '@vueuse/core'

const breakpoints = useBreakpoints(breakpointsTailwind)
const isMobileBp = breakpoints.smaller('md')
const router = useRouter()
const route = useRoute()
const { results, isLoading, error, search, clear } = useShowSearch()
const initialPage = Number(route.query.page ?? 1)
const {
  shows,
  showsSortedByGenre,
  currentPage,
  nextPage,
  previousPage,
  isLoading: isLoadingShows,
  error: showsListError,
  refresh: refreshShows,
} = useShowList({ page: initialPage })
const { list, containerProps, wrapperProps } = useVirtualList(shows, {
  itemHeight: 120,
})

const query = ref('')
const isSearchVisible = ref(false)

function onClear() {
  query.value = ''
  clear()
}

function navigateToShowDetails(showId: number) {
  router.push({ name: 'show-details', params: { id: showId } })
}

function toggleSearch() {
  isSearchVisible.value = !isSearchVisible.value
}

watch(query, (q) => search(q))
watch(currentPage, (page) => {
  router.replace({ query: { page } })
})
</script>

<template>
  <div
    class="flex flex-row items-center gap-2 bg-gray-900 px-2 py-3"
    role="region"
    aria-label="Featured shows"
  >
    <MagnifyingGlassCircleIcon
      @click="toggleSearch"
      class="ml-4 w-6 h-6 text-gray-400"
      aria-hidden="true"
      v-tooltip="{ text: 'Toggle search', placement: 'right' }"
    />
    <Transition name="fade">
      <div
        v-if="isSearchVisible"
        class="min-h-[61px] border-t border-gray-800 bg-gray-900 p-3 flex items-center gap-3"
        role="search"
      >
        <label for="show-search" class="sr-only">Search shows</label>
        <input
          id="show-search"
          v-model="query"
          type="search"
          placeholder="Search shows..."
          autocomplete="off"
          class="flex-1 bg-gray-800 text-white placeholder-gray-500 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          v-if="query"
          @click="onClear"
          aria-label="Clear search"
          class="text-gray-400 hover:text-white transition-colors text-sm px-3"
        >
          Clear
        </button>
      </div>
    </Transition>
  </div>

  <div v-if="!isMobileBp" role="region" aria-label="Featured shows by genre">
    <div v-if="isLoadingShows" class="text-gray-400 text-sm px-4 py-3" aria-busy="true">
      Loading shows...
    </div>
    <ApiError v-else-if="showsListError" :message="showsListError" @retry="refreshShows()" />
    <template v-else>
      <div v-if="!results.length">
        <ShowsGenreRow
          v-for="[genre, genreShows] in showsSortedByGenre"
          :key="genre"
          :genre="genre"
          :shows="genreShows"
          @loadNextPage="nextPage()"
          @loadPreviousPage="previousPage()"
        />
      </div>
    </template>
  </div>
  <div class="flex flex-col flex-1 overflow-hidden bg-gray-950 text-white">
    <div
      v-if="query"
      class="flex-1 overflow-y-auto p-4"
      role="region"
      :aria-label="`Search results for ${query}`"
      aria-live="polite"
    >
      <div v-if="isLoading" class="text-gray-400 text-sm p-4" aria-busy="true">Searching...</div>
      <div v-else-if="error" class="text-red-400 text-sm p-4" role="alert">{{ error }}</div>
      <div v-else-if="!results.length" class="text-gray-500 text-sm p-4">
        No results for "{{ query }}"
      </div>
      <div
        v-else
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
        role="list"
      >
        <div
          v-for="{ show } in results"
          :key="show.id"
          role="listitem"
          :aria-label="show.name"
          tabindex="0"
          @click="navigateToShowDetails(show.id)"
          @keydown.enter="navigateToShowDetails(show.id)"
          class="rounded-lg overflow-hidden bg-gray-800 hover:scale-105 transition-transform cursor-pointer"
        >
          <img
            :src="show.image?.medium"
            :alt="show.name"
            class="w-full object-cover aspect-[2/3]"
          />
          <p class="p-2 text-sm font-medium truncate">{{ show.name }}</p>
        </div>
      </div>
    </div>

    <div v-if="isMobileBp">
      <div
        v-bind="containerProps"
        class="flex-1 overflow-y-auto p-4"
        role="region"
        aria-label="Today's schedule"
      >
        <div v-if="isLoadingShows" class="text-gray-400 text-sm p-4" aria-busy="true">
          Loading schedule...
        </div>
        <div v-else-if="showsListError" class="text-red-400 text-sm p-4" role="alert">
          {{ showsListError }}
        </div>
        <div v-else v-bind="wrapperProps" role="list">
          <div
            v-for="{ data: show } in list"
            :key="show.id"
            role="listitem"
            :aria-label="show.name"
            tabindex="0"
            @click="navigateToShowDetails(show.id)"
            @keydown.enter="navigateToShowDetails(show.id)"
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
      </div>
    </div>
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
</style>
