import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSearchStore } from '../search'
import type { SearchResult } from '@/types/tvShowModel'

describe('useSearchStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('has correct initial state', () => {
    const store = useSearchStore()
    expect(store.query).toBe('')
    expect(store.results).toEqual([])
    expect(store.isLoading).toBe(false)
    expect(store.recentQueries).toEqual([])
  })

  describe('computed', () => {
    it('hasResults is false when results are empty', () => {
      const store = useSearchStore()
      expect(store.hasResults).toBe(false)
    })

    it('hasResults is true when results exist', () => {
      const store = useSearchStore()
      store.setResults([{ score: 1, show: { id: 1 } }] as SearchResult[])
      expect(store.hasResults).toBe(true)
    })

    it('isEmpty is true when query set, not loading, and no results', () => {
      const store = useSearchStore()
      store.setQuery('something')
      expect(store.isEmpty).toBe(true)
    })

    it('isEmpty is false while loading', () => {
      const store = useSearchStore()
      store.setQuery('something')
      store.setLoading(true)
      expect(store.isEmpty).toBe(false)
    })
  })

  describe('setQuery', () => {
    it('updates query', () => {
      const store = useSearchStore()
      store.setQuery('game of thrones')
      expect(store.query).toBe('game of thrones')
    })
  })

  describe('setResults', () => {
    it('updates results', () => {
      const store = useSearchStore()
      const data = [{ score: 0.9, show: { id: 2 } }] as SearchResult[]
      store.setResults(data)
      expect(store.results).toEqual(data)
    })
  })

  describe('pushRecentQuery', () => {
    it('adds a query to recent queries', () => {
      const store = useSearchStore()
      store.pushRecentQuery('breaking bad')
      expect(store.recentQueries).toContain('breaking bad')
    })

    it('deduplicates and keeps most recent first', () => {
      const store = useSearchStore()
      store.pushRecentQuery('first')
      store.pushRecentQuery('second')
      store.pushRecentQuery('first')
      expect(store.recentQueries[0]).toBe('first')
      expect(store.recentQueries).toHaveLength(2)
    })

    it('ignores blank queries', () => {
      const store = useSearchStore()
      store.pushRecentQuery('   ')
      expect(store.recentQueries).toHaveLength(0)
    })

    it('caps at 10 recent queries', () => {
      const store = useSearchStore()
      for (let i = 0; i < 12; i++) store.pushRecentQuery(`query ${i}`)
      expect(store.recentQueries).toHaveLength(10)
    })
  })

  describe('clearSearch', () => {
    it('resets query and results', () => {
      const store = useSearchStore()
      store.setQuery('test')
      store.setResults([{ score: 1, show: { id: 1 }  }] as SearchResult[])
      store.clearSearch()
      expect(store.query).toBe('')
      expect(store.results).toEqual([])
    })
  })
})
