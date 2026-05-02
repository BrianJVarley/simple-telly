import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { defineComponent, nextTick } from 'vue'
import { useShowSearch } from '../useShowSearch'
import * as api from '@/api/tvmaze-api'
import type { SearchResult } from '@/types/tvShowModel'

vi.mock('@/api/tvmaze-api')

function makeResult(id: number): SearchResult {
  return {
    score: 0.9,
    show: {
      id,
      name: `Show ${id}`,
      type: 'Scripted',
      language: 'English',
      genres: [],
      status: 'Running',
      rating: { average: null },
      schedule: { time: '', days: [] },
      network: null,
      summary: null,
      image: null,
      premiered: null,
      officialSite: null,
    },
  }
}

function useComposable<T>(setup: () => T): T {
  let result!: T
  const Wrapper = defineComponent({
    setup() {
      result = setup()
      return {}
    },
    template: '<div/>',
  })
  mount(Wrapper, { global: { plugins: [createPinia()] } })
  return result
}

describe('useShowSearch', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  it('starts with empty results', () => {
    const { results, isLoading, error } = useComposable(() => useShowSearch())
    expect(results.value).toEqual([])
    expect(isLoading.value).toBe(false)
    expect(error.value).toBeNull()
  })

  it('clears results for empty query without calling API', async () => {
    const { search, results } = useComposable(() => useShowSearch())
    search('  ')
    vi.runAllTimers()
    await nextTick()
    expect(api.tvmazeApi.searchShows).not.toHaveBeenCalled()
    expect(results.value).toEqual([])
  })

  it('debounces search calls', async () => {
    vi.mocked(api.tvmazeApi.searchShows).mockResolvedValue([makeResult(1)])
    const { search } = useComposable(() => useShowSearch())

    search('a')
    search('ab')
    search('abc')
    vi.runAllTimers()
    await nextTick()
    await nextTick()

    expect(api.tvmazeApi.searchShows).toHaveBeenCalledTimes(1)
    expect(api.tvmazeApi.searchShows).toHaveBeenCalledWith('abc')
  })

  it('populates results after search', async () => {
    const data = [makeResult(1), makeResult(2)]
    vi.mocked(api.tvmazeApi.searchShows).mockResolvedValue(data)
    const { search, results } = useComposable(() => useShowSearch())

    search('test')
    vi.runAllTimers()
    await nextTick()
    await nextTick()

    expect(results.value).toHaveLength(2)
  })

  it('sets error and clears results on API failure', async () => {
    vi.mocked(api.tvmazeApi.searchShows).mockRejectedValue(new Error('Search failed'))
    const { search, results, error } = useComposable(() => useShowSearch())

    search('bad query')
    vi.runAllTimers()
    await nextTick()
    await nextTick()

    expect(error.value).toBe('Search failed')
    expect(results.value).toEqual([])
  })

  it('clear resets results and error', async () => {
    const data = [makeResult(1)]
    vi.mocked(api.tvmazeApi.searchShows).mockResolvedValue(data)
    const { search, clear, results } = useComposable(() => useShowSearch())

    search('test')
    vi.runAllTimers()
    await nextTick()
    await nextTick()

    clear()
    expect(results.value).toEqual([])
  })
})
