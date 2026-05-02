import { ref, computed, onMounted, type ComputedRef } from 'vue'
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
  showsTopPick: Show | null
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

  const ids = ref<number[]>([])
  const isLoading = ref(false)
  const hasMorePages = ref(true)
  const isAccumulated = ref(false)
  const error = ref<{ message: string; cause?: ApiErrorCause | undefined } | null>(null)

  const shows = computed(() => {
    return ids.value.map((id) => showsStore.getById(id)).filter(Boolean) as Show[]
  })

  const totalShows = computed(() =>
    shows.value.length ?? 0,
  )

  const derivedShowsState = computed(() => {
    const groupedShows = new Map<string, Show[]>()
    let showsTopPick: Show | null = null

    for (const show of shows.value) {
      if (!showsTopPick || (show.rating.average ?? 0) > (showsTopPick.rating.average ?? 0)) {
        showsTopPick = show
      }

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
      showsTopPick,
      showsSortedByGenre,
    }
  }) as ComputedRef<DerivedShowsState>

  /**
   * Picks the top rated show on each page.
   */
  const showsTopPick = computed(() => derivedShowsState.value.showsTopPick)

  const showsSortedByGenre = computed(() => derivedShowsState.value.showsSortedByGenre)

  const currentPage = ref<number>(options?.page ?? 0)

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

      showsStore.upsertMany(data)

      if (append) {
        const existingIds = new Set(ids.value)
        ids.value = [...ids.value, ...nextIds.filter((id) => !existingIds.has(id))]
      } else {
        ids.value = nextIds
      }

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
    showsSortedByGenre,
    showsTopPick,
    currentPage,
    hasMorePages,
    isAccumulated,
    totalShows,
    nextPage,
    appendNextPage,
    previousPage,
    goToFirstPage,
    goToPage,
    loadPage: load,
    isLoading,
    error,
    refresh,
  }
}
