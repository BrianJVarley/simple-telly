<script setup lang="ts">
import { useShowList } from '@/composables/useShowList'
import { useShowSearch } from '@/composables/useShowSearch'
import { ref, watch, onActivated, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useBreakpoints, breakpointsTailwind } from '@vueuse/core'
import { useShowNavigation } from '@/composables/useShowNavigation'
import SearchBar from '@/components/SearchBar.vue'
import ShowsDesktopGrid from './ShowsDesktopGrid.vue'
import ShowsSearchResults from './ShowsSearchResults.vue'
import ShowsMobileList from './ShowsMobileList.vue'
import { useDocumentTitleHelper } from '@/composables/useDocumentTitleHelper'

const breakpoints = useBreakpoints(breakpointsTailwind)
const isMobileBp = breakpoints.smaller('md')
const router = useRouter()
const route = useRoute()
const { captureBeforeNavigate, restoreAfterBackNavigation } = useShowNavigation()
const { setDocumentTitle } = useDocumentTitleHelper()
const { results, isLoading, error, search, clear } = useShowSearch()
const initialPageQuery = Number(route.query.page ?? 1)
const initialPage =
  Number.isFinite(initialPageQuery) && initialPageQuery > 0 ? initialPageQuery - 1 : 0
const {
  shows,
  showsSortedByGenre,
  currentPage,
  isAccumulated,
  nextPage,
  previousPage,
  isLoading: isLoadingShows,
  error: showsListError,
  goToFirstPage,
  loadPage,
  refresh: refreshShows,
} = useShowList({ page: initialPage })
const query = ref('')

function setShowsPageTitle() {
  setDocumentTitle('Shows')
}

function onClear() {
  query.value = ''
  clear()
}

function navigateToShowDetails(showId: number) {
  captureBeforeNavigate(showId, { saveScroll: !isMobileBp.value })
  router.push({ name: 'show-details', params: { id: showId }, query: {} })
}

onMounted(() => {
  setShowsPageTitle()
})

onActivated(async () => {
  setShowsPageTitle()
  await nextTick()
  restoreAfterBackNavigation()
})

watch(query, (q) => search(q))
watch(currentPage, (page) => {
  if (route.name !== 'home' && route.name !== 'shows') {
    return
  }

  router.replace({
    name: route.name,
    query: { page: String(page + 1) },
  })
})

watch(isMobileBp, (isMobile) => {
  if (!isMobile && isAccumulated.value) {
    loadPage(currentPage.value)
  }
})

watch(
  () => route.query.page,
  (page) => {
    const nextPageQuery = Number(page ?? 1)
    const pageNum = Number.isFinite(nextPageQuery) && nextPageQuery > 0 ? nextPageQuery - 1 : 0

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
    :currentPage="currentPage + 1"
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
      :error="showsListError"
      @select="navigateToShowDetails"
      @refresh="refreshShows"
      @goToFirstPage="goToFirstPage"
    />
  </div>
</template>
