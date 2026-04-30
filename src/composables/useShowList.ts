import { ref, computed, onMounted } from 'vue'
import type { Show } from '@/types/tvShowModel'
import { tvmazeApi } from '@/api/tvmaze-api'
import { useShowsStore } from '@/stores/shows'

export type ListType = 'search' | 'schedule'

export interface UseShowListOptions {
  type: 'schedule'
  date?: string
  countryCode?: string
}

export function useShowList(options: UseShowListOptions) {
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

  async function load() {
    isLoading.value = true
    error.value = null

    try {
      let data: Show[] = []

      const episodes = await tvmazeApi.getSchedule(options.date, options.countryCode)
      data = episodes.map((e) => e.show).filter((s): s is Show => s != null)

      showsStore.upsertMany(data)
      ids.value = data.map((s) => s.id)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load shows'
    } finally {
      isLoading.value = false
    }
  }

  function refresh() {
    return load()
  }

  onMounted(load)

  return {
    shows: computed(() => Array.from(showsSortedByGenre.value.values()).flat()),
    showsSortedByGenre,
    isLoading,
    error,
    refresh,
  }
}
