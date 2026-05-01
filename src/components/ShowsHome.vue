<script setup lang="ts">
import { useShowList } from '@/composables/useShowList'
import { useShowSearch } from '@/composables/useShowSearch'
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useBreakpoints, breakpointsTailwind } from '@vueuse/core'
import SearchBar from '@/components/SearchBar.vue'
import ShowsDesktopGrid from './ShowsDesktopGrid.vue'
import ShowsSearchResults from './ShowsSearchResults.vue'
import ShowsMobileList from './ShowsMobileList.vue'

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
  hasMorePages,
  isAccumulated,
  nextPage,
  appendNextPage,
  previousPage,
  isLoading: isLoadingShows,
  error: showsListError,
  goToFirstPage,
  loadPage,
  refresh: refreshShows,
} = useShowList({ page: initialPage })

const query = ref('')

function onClear() {
  query.value = ''
  clear()
}

function navigateToShowDetails(showId: number) {
  router.push({ name: 'show-details', params: { id: showId } })
}

watch(query, (q) => search(q))
watch(currentPage, (page) => {
  router.replace({ query: { page } })
})

watch(isMobileBp, (isMobile) => {
  if (!isMobile && isAccumulated.value) {
    loadPage(currentPage.value)
  }
})

watch(
  () => route.query.page,
  (page) => {
    const pageNum = Number(page ?? 0)
    if (pageNum !== currentPage.value) {
      loadPage(pageNum)
    }
  },
)
</script>

<template>
  <SearchBar v-model:query="query" @clear="onClear" />
  <ShowsDesktopGrid
    v-if="!isMobileBp"
    :showsSortedByGenre
    :shows
    :isLoading="isLoadingShows"
    :error="showsListError"
    :currentPage
    :hasSearchResults="results.length > 0"
    @refresh="refreshShows"
    @goToFirstPage="goToFirstPage"
    @nextPage="nextPage"
    @previousPage="previousPage"
  />
  <div
    class="flex flex-col flex-1 overflow-hidden"
    :style="{ backgroundColor: 'var(--color-background)', color: 'var(--color-text)' }"
  >
    <ShowsSearchResults :query :results :isLoading :error @select="navigateToShowDetails" />
    <ShowsMobileList
      v-if="isMobileBp"
      :shows
      :isLoading="isLoadingShows"
      :canLoadMore="hasMorePages"
      :error="showsListError"
      @reachEnd="appendNextPage"
      @select="navigateToShowDetails"
      @refresh="refreshShows"
      @goToFirstPage="goToFirstPage"
    />
  </div>
</template>
