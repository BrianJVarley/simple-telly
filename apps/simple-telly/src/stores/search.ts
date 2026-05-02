import type { SearchResult } from '@/types/tvShowModel'
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useSearchStore = defineStore('search', () => {
  const query = ref('')
  const results = ref<SearchResult[]>([])
  const isLoading = ref(false)
  const recentQueries = ref<string[]>([])

  const hasResults = computed(() => results.value.length > 0)
  const isEmpty = computed(() => !isLoading.value && query.value.length > 0 && !hasResults.value)

  function setQuery(q: string) {
    query.value = q
  }

  function setResults(data: SearchResult[]) {
    results.value = data
  }

  function setLoading(val: boolean) {
    isLoading.value = val
  }

  function pushRecentQuery(q: string) {
    const trimmed = q.trim()
    if (!trimmed) return
    recentQueries.value = [trimmed, ...recentQueries.value.filter((r) => r !== trimmed)].slice(0, 10)
  }

  function clearSearch() {
    query.value = ''
    results.value = []
  }

  return {
    query,
    results,
    isLoading,
    recentQueries,
    hasResults,
    isEmpty,
    setQuery,
    setResults,
    setLoading,
    pushRecentQuery,
    clearSearch,
  }
})
