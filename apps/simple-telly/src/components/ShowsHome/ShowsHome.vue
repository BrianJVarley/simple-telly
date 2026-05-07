<script setup lang="ts">
import { useShowList } from '@/composables/useShowList'
import { useShowSearch } from '@/composables/useShowSearch'
import { ref, watch, onActivated, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useBreakpoints, breakpointsTailwind } from '@vueuse/core'
import { useShowNavigation } from '@/composables/useShowNavigation'
import SearchBar from '@/components/ShowsHome/SearchBar.vue'
import ShowsDesktopGrid from './ShowsDesktopGrid.vue'
import ShowsSearchResults from './ShowsSearchResults.vue'
import ShowsMobileList from './ShowsMobileList.vue'
import { useDocumentTitleHelper } from '@/composables/useDocumentTitleHelper'
import ShowsTopPick from './ShowsTopPick.vue'
import { ShowFilterWidget } from '@simple-telly/ui'

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
  showsTopPick,
  showsSortedByGenre,
  showGenres,
  currentPage,
  isAccumulated,
  nextPage,
  previousPage,
  filterShowsByGenre,
  totalShows,
  isLoading: isLoadingShows,
  error: showsListError,
  goToFirstPage,
  goToPage,
  loadPage,
  appendNextPage,
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
  router.push({ name: 'show-details', params: { id: showId }, query: { page: route.query.page } })
}

/**
 *  Apply genre filter and update URL query parameter for deep linking
 * @param genre
 */
function onGenreFilterApplied(genre: string) {
  // clear any active search query when filtering by genre
  onClear()
  filterShowsByGenre(genre)
  router.replace({ query: { ...route.query, genre: genre === 'All' ? undefined : genre } })
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

/**
 * Sync current page with URL query parameter for deep links
 */
watch(currentPage, (page) => {
  if (route.name !== 'home' && route.name !== 'shows') {
    return
  }

  router.replace({
    name: route.name,
    query: { ...route.query, page: String(page + 1) },
  })
})

/**
 * Resize to desktop / tablet breakpoint, ugh several pages on mobile and then switches to desktop, reload current page
 */
watch(isMobileBp, (isMobile) => {
  if (!isMobile && isAccumulated.value) {
    loadPage(currentPage.value)
  }
})

/**
 * Re-apply page filter when navigating back to the shows list
 */
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

/**
 * Reapply selected genre filter when navigating back to the shows list
 */
watch(
  () => route.query.genre,
  (genre) => {
    if (genre) {
      filterShowsByGenre(genre as string)
    }
  },
)
</script>

<template>
  <div class="search-filter-container sm:gap-4">
    <SearchBar data-testid="search-bar" v-model:query="query" @clear="onClear" />
    <ShowFilterWidget
      data-testid="show-filter-widget"
      :genres="showGenres"
      @filterApplied="
        (value: string) => {
          onGenreFilterApplied(value)
        }
      "
    />
  </div>
  <Transition name="fade">
    <ShowsTopPick
      v-if="!isMobileBp && !query && showsTopPick"
      :show="showsTopPick"
      @select="navigateToShowDetails"
    />
  </Transition>

  <ShowsDesktopGrid
    v-if="!isMobileBp"
    :shows="showsSortedByGenre"
    :isLoading="isLoadingShows"
    :error="showsListError"
    :currentPage="currentPage + 1"
    :hasSearchResults="results.length > 0"
    @refresh="refreshShows"
    @goToFirstPage="goToFirstPage"
    @nextPage="nextPage"
    @skip-backward="(value) => goToPage(value)"
    @skip-forward="(value) => goToPage(value)"
    @previousPage="previousPage"
  />
  <div class="flex flex-col flex-1 overflow-hidden">
    <ShowsSearchResults :query :results :isLoading :error @select="navigateToShowDetails" />
    <ShowsMobileList
      v-if="isMobileBp"
      :shows="showsSortedByGenre"
      :totalShows="totalShows"
      :isLoading="isLoadingShows"
      :error="showsListError"
      @select="navigateToShowDetails"
      @refresh="refreshShows"
      @goToFirstPage="goToFirstPage"
      @next-page="appendNextPage"
    />
  </div>
</template>

<style scoped>
.search-filter-container {
  display: grid;
  grid-template-columns: 1fr auto; /* icon | input | genre filter */
  align-items: center;
  gap: 1rem;
  padding-right: 3rem;
  background-color: var(--color-background-soft);
  padding-bottom: 0.3rem;
  padding-top: 0.1rem;
}
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
