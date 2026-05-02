import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useShowsStore } from '../shows'
import type { Show } from '@/types/tvShowModel'

function makeShow(id: number, overrides: Partial<Show> = {}): Show {
  return {
    id,
    name: `Show ${id}`,
    type: 'Scripted',
    language: 'English',
    genres: ['Drama'],
    status: 'Running',
    schedule: { time: '21:00', days: ['Monday'] },
    rating: { average: 8.0 },
    network: { id: 1, name: 'HBO' },
    summary: null,
    image: null,
    premiered: null,
    officialSite: null,
    ...overrides,
  }
}

describe('useShowsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('starts with an empty cache', () => {
    const store = useShowsStore()
    expect(store.all).toEqual([])
  })

  describe('upsert', () => {
    it('adds a show to the cache', () => {
      const store = useShowsStore()
      store.upsert(makeShow(1))
      expect(store.all).toHaveLength(1)
      expect(store.getById(1)?.name).toBe('Show 1')
    })

    it('overwrites an existing show', () => {
      const store = useShowsStore()
      store.upsert(makeShow(1, { name: 'Old Name' }))
      store.upsert(makeShow(1, { name: 'New Name' }))
      expect(store.all).toHaveLength(1)
      expect(store.getById(1)?.name).toBe('New Name')
    })
  })

  describe('upsertMany', () => {
    it('adds multiple shows', () => {
      const store = useShowsStore()
      store.upsertMany([makeShow(1), makeShow(2), makeShow(3)])
      expect(store.all).toHaveLength(3)
    })
  })

  describe('getById', () => {
    it('returns the show when it exists', () => {
      const store = useShowsStore()
      store.upsert(makeShow(5))
      expect(store.getById(5)).toBeDefined()
      expect(store.getById(5)?.id).toBe(5)
    })

    it('returns undefined for unknown id', () => {
      const store = useShowsStore()
      expect(store.getById(999)).toBeUndefined()
    })
  })

  describe('clear', () => {
    it('empties the cache', () => {
      const store = useShowsStore()
      store.upsertMany([makeShow(1), makeShow(2)])
      store.clear()
      expect(store.all).toHaveLength(0)
    })
  })
})
