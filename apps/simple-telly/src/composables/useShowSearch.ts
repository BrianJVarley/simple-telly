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
  // Note: We use an AbortController to cancel the previous request if
  // a new search is initiated before the previous one completes.
  let currentController: AbortController | null = null

  async function search(query: string) {
    clearTimeout(debounceTimer)
    currentController?.abort()
    currentController = null

    if (!query.trim()) {
      results.value = []
      searchStore.setResults([])
      isLoading.value = false
      return
    }

    debounceTimer = setTimeout(async () => {
      const controller = new AbortController()
      currentController = controller
      isLoading.value = true
      error.value = null

      try {
        const data = await tvmazeApi.searchShows(query, { signal: controller.signal })
        results.value = data
        searchStore.setResults(data)
      } catch (err) {
        if (controller.signal.aborted) return
        error.value = err instanceof Error ? err.message : 'Search failed'
        results.value = []
      } finally {
        if (currentController !== controller) return
        currentController = null
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
