import { ref, computed, onMounted } from 'vue'
import type { Show } from '@/types/tvShowModel'
import { tvmazeApi } from '@/api/tvmaze-api'
import { useShowsStore } from '@/stores/shows'

export type ListType = 'search' | 'schedule'

export interface UseShowListOptions {
  page?: number
}

export function useShowList(options?: UseShowListOptions) {
  const showsStore = useShowsStore()

  const ids = ref<number[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const shows = computed(() => {
    const list = ids.value.map((id) => showsStore.getById(id)).filter(Boolean) as Show[]
    return list.sort((a, b) => (b.rating.average ?? 0) - (a.rating.average ?? 0))
  })

  const showsSortedByGenre = computed(() => {
    return shows.value.reduce((map, show) => {
      const genreKey = show.genres[0] ?? 'Other'
      const list = map.get(genreKey) ?? []
      list.push(show)
      map.set(genreKey, list)
      return map
    }, new Map<string, Show[]>())
  })

  const currentPage = ref<number>(options?.page ?? 0)

  async function load(page?: number) {
    const targetPage = page ?? currentPage.value
    currentPage.value = targetPage
    isLoading.value = true
    error.value = null

    try {
      let data: Show[] = []
      data = await tvmazeApi.getShows(targetPage)
      showsStore.upsertMany(data)
      ids.value = data.map((s) => s.id)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load shows'
    } finally {
      isLoading.value = false
    }
  }

  function nextPage() {
    return load(currentPage.value + 1)
  }

  function previousPage() {
    if (currentPage.value > 0) {
      return load(currentPage.value - 1)
    }
  }

  function refresh() {
    return load()
  }

  onMounted(load)

  return {
    shows: computed(() => Array.from(showsSortedByGenre.value.values()).flat()),
    showsSortedByGenre,
    currentPage,
    nextPage,
    previousPage,
    isLoading,
    error,
    refresh,
  }
}
