import { ref, watch } from 'vue'
import { tvmazeApi } from '@/api/tvmaze-api'
import type { SearchResult } from '@/types/tvShowModel'
import { useSearchStore } from '@/stores/search'

export function useShowSearch() {
  const searchStore = useSearchStore()

  const results = ref<SearchResult[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  let debounceTimer: ReturnType<typeof setTimeout>

  async function search(query: string) {
    clearTimeout(debounceTimer)

    if (!query.trim()) {
      results.value = []
      searchStore.setResults([])
      return
    }

    debounceTimer = setTimeout(async () => {
      isLoading.value = true
      error.value = null

      try {
        const data = await tvmazeApi.searchShows(query)
        results.value = data
        searchStore.setResults(data)
      } catch (err) {
        error.value = err instanceof Error ? err.message : 'Search failed'
        results.value = []
      } finally {
        isLoading.value = false
      }
    }, 300)
  }

  function clear() {
    results.value = []
    error.value = null
    searchStore.setResults([])
  }

  watch(
    () => searchStore.query,
    (q) => search(q),
  )

  return { results, isLoading, error, search, clear }
}
