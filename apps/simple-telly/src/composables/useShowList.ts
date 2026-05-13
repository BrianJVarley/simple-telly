import { ref, computed, onMounted } from 'vue'
import type { Show, ShowsByGenre } from '@/types/tvShowModel'
import { tvmazeApi } from '@/api/tvmaze-api'
import { useShowsStore } from '@/stores/shows'
import { ApiErrorTypes } from '@/types/apiErrorModel'

export interface UseShowListOptions {
  page?: number
}

interface LoadOptions {
  append?: boolean
  suppressNotFoundError?: boolean
}

type ApiErrorCause = keyof typeof ApiErrorTypes

interface DerivedShowsState {
  showsSortedByGenre: ShowsByGenre
}

function getErrorCause(err: unknown): ApiErrorCause | undefined {
  if (typeof err !== 'object' || err === null || !('cause' in err)) {
    return undefined
  }

  const cause = (err as { cause?: unknown }).cause
  if (typeof cause === 'string' && cause in ApiErrorTypes) {
    return cause as ApiErrorCause
  }

  return undefined
}

/**
 * Composable to manage fetching and state of TV shows list with pagination, sorting, and error handling.
 * @param options
 * @returns
 */
export function useShowList(options?: UseShowListOptions) {
  const showsStore = useShowsStore()

  const allShowIds = ref<number[]>([])
  const showIds = ref<number[]>([])
  const isLoading = ref(false)
  const hasMorePages = ref(true)
  const isAccumulated = ref(false)
  const error = ref<{ message: string; cause?: ApiErrorCause | undefined } | null>(null)

  const shows = computed(() => {
    return showIds.value.map((id) => showsStore.getById(id)).filter(Boolean) as Show[]
  })

  const showsTopPick = ref<Show | null>(null)

  function getTopPickFromShows(shows: Show[]): Show | null {
    if (shows.length === 0) {
      return null
    }

    return shows.reduce((topPick, show) => {
      return (show.rating.average ?? 0) > (topPick.rating.average ?? 0) ? show : topPick
    })
  }

  const totalShows = computed(() => shows.value.length ?? 0)

  const allShows = computed(() => {
    return allShowIds.value.map((id) => showsStore.getById(id)).filter(Boolean) as Show[]
  })

  const derivedShowsState = computed<DerivedShowsState>(() => {
    const groupedShows = new Map<string, Show[]>()

    for (const show of allShows.value) {
      const genreKey = show.genres[0] ?? 'Other'
      const genreShows = groupedShows.get(genreKey) ?? []

      genreShows.push(show)
      groupedShows.set(genreKey, genreShows)
    }

    const showsSortedByGenre = new Map(
      [...groupedShows.entries()]
        .map(
          ([genre, genreShows]) =>
            [
              genre,
              [...genreShows].sort((a, b) => {
                const aRating = a.rating.average
                const bRating = b.rating.average

                if (aRating === null && bRating === null) return 0
                if (aRating === null) return 1
                if (bRating === null) return -1

                return bRating - aRating
              }),
            ] as const,
        )
        .sort(([a], [b]) => a.localeCompare(b)),
    ) as ShowsByGenre

    return {
      showsSortedByGenre,
    }
  })

  const showsSortedByGenre = computed(() => derivedShowsState.value.showsSortedByGenre)
  const activeGenreFilter = ref<string | null>(null)

  const filteredShowsSortedByGenre = computed(() => {
    if (!activeGenreFilter.value || activeGenreFilter.value === 'All') {
      return showsSortedByGenre.value
    }
    const genreShows = showsSortedByGenre.value.get(activeGenreFilter.value)
    if (!genreShows) return new Map() as ShowsByGenre

    return new Map([[activeGenreFilter.value, genreShows]]) as ShowsByGenre
  })

  const currentPage = ref<number>(options?.page ?? 0)

  const filterShowsByGenre = (genre: string) => {
    activeGenreFilter.value = genre

    if (genre === 'All') {
      showIds.value = [...allShowIds.value]
      isAccumulated.value = false
      return
    }

    // Filter shows based on genre filter selection
    const genreShows = showsSortedByGenre.value.get(genre)
    if (genreShows) {
      showIds.value = genreShows.map((show) => show.id)
      isAccumulated.value = false
    }
  }

  async function load(page?: number, loadOptions: LoadOptions = {}) {
    const targetPage = page ?? currentPage.value
    const { append = false, suppressNotFoundError = false } = loadOptions

    if (append && (!hasMorePages.value || isLoading.value)) {
      return
    }

    isLoading.value = true
    error.value = null

    try {
      const data = await tvmazeApi.getShows(targetPage)
      const nextIds = data.map((show) => show.id)

      // Assign top pick exactly once from page 0 data.
      if (showsTopPick.value === null) {
        if (targetPage === 0) {
          showsTopPick.value = getTopPickFromShows(data)
        } else {
          try {
            const firstPageData = await tvmazeApi.getShows(0)
            showsStore.upsertMany(firstPageData)
            showsTopPick.value = getTopPickFromShows(firstPageData)
          } catch {
          }
        }
      }

      showsStore.upsertMany(data)

      if (append) {
        const existingIds = new Set(allShowIds.value)
        allShowIds.value = [...allShowIds.value, ...nextIds.filter((id) => !existingIds.has(id))]
      } else {
        allShowIds.value = nextIds
      }

      showIds.value = [...allShowIds.value]

      currentPage.value = targetPage
      hasMorePages.value = data.length > 0
      isAccumulated.value = append
    } catch (err) {
      const cause = getErrorCause(err)

      if (append && cause === ApiErrorTypes['Not Found']) {
        hasMorePages.value = false
      } else if (err instanceof Error) {
        error.value = { message: err.message, cause }
      } else {
        error.value = { message: 'Failed to load shows' }
      }

      if (append && suppressNotFoundError && cause === ApiErrorTypes['Not Found']) {
        error.value = null
      }
    } finally {
      isLoading.value = false
    }
  }

  function nextPage() {
    return load(currentPage.value + 1)
  }

  function appendNextPage() {
    return load(currentPage.value + 1, { append: true, suppressNotFoundError: true })
  }

  function previousPage() {
    if (currentPage.value > 0) {
      return load(currentPage.value - 1)
    }
  }

  function goToPage(page: number) {
    const targetPage = currentPage.value + page
    return load(Math.max(0, targetPage))
  }

  function goToFirstPage() {
    return load(0)
  }

  function refresh() {
    return load(currentPage.value, { append: false })
  }

  onMounted(load)

  return {
    shows,
    showsSortedByGenre: filteredShowsSortedByGenre,
    showsTopPick,
    currentPage,
    hasMorePages,
    isAccumulated,
    totalShows,
    nextPage,
    appendNextPage,
    filterShowsByGenre,
    previousPage,
    goToFirstPage,
    goToPage,
    loadPage: load,
    isLoading,
    error,
    refresh,
  }
}
