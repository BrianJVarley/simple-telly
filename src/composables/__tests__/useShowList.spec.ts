import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { defineComponent, nextTick } from 'vue'
import { useShowList } from '../useShowList'
import * as api from '@/api/tvmaze-api'
import type { Show, Episode } from '@/types/tvShowModel'

vi.mock('@/api/tvmaze-api')

function makeShow(id: number, genre: string, rating: number | null = 8.0): Show {
  return {
    id,
    name: `Show ${id}`,
    type: 'Scripted',
    language: 'English',
    genres: [genre],
    status: 'Running',
    rating: { average: rating },
    network: null,
    summary: null,
    image: null,
    premiered: null,
    officialSite: null,
  }
}

function makeEpisode(show: Show): Episode {
  return {
    id: show.id * 100,
    name: `Ep`,
    season: 1,
    number: 1,
    airdate: '2024-01-01',
    airtime: '21:00',
    runtime: 60,
    summary: null,
    image: null,
    show,
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

describe('useShowList', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('fetches schedule on mount and populates shows', async () => {
    const shows = [makeShow(1, 'Drama', 9.0), makeShow(2, 'Comedy', 7.0)]
    vi.mocked(api.tvmazeApi.getShows).mockResolvedValue(shows.map(makeEpisode))

    const { shows: showsRef, isLoading } = useComposable(() => useShowList({ type: 'schedule' }))

    expect(isLoading.value).toBe(true)
    await nextTick()
    await nextTick()
    expect(showsRef.value).toHaveLength(2)
    expect(isLoading.value).toBe(false)
  })

  it('sorts shows by rating descending', async () => {
    const shows = [makeShow(1, 'Drama', 6.0), makeShow(2, 'Drama', 9.0), makeShow(3, 'Drama', 7.5)]
    vi.mocked(api.tvmazeApi.getShows).mockResolvedValue(shows.map(makeEpisode))

    const { shows: showsRef } = useComposable(() => useShowList({ type: 'schedule' }))
    await nextTick()
    await nextTick()
    const ratings = showsRef.value.map((s) => s.rating.average)
    expect(ratings).toEqual([9.0, 7.5, 6.0])
  })

  it('groups shows by first genre in showsSortedByGenre', async () => {
    const shows = [makeShow(1, 'Drama'), makeShow(2, 'Comedy'), makeShow(3, 'Drama')]
    vi.mocked(api.tvmazeApi.getShows).mockResolvedValue(shows.map(makeEpisode))

    const { showsSortedByGenre } = useComposable(() => useShowList({ type: 'schedule' }))
    await nextTick()
    await nextTick()
    expect(showsSortedByGenre.value.get('Drama')).toHaveLength(2)
    expect(showsSortedByGenre.value.get('Comedy')).toHaveLength(1)
  })

  it('falls back to "Other" for shows with no genres', async () => {
    const show = makeShow(1, '')
    show.genres = []
    vi.mocked(api.tvmazeApi.getShows).mockResolvedValue([makeEpisode(show)])

    const { showsSortedByGenre } = useComposable(() => useShowList({ type: 'schedule' }))
    await nextTick()
    await nextTick()
    expect(showsSortedByGenre.value.has('Other')).toBe(true)
  })

  it('filters out episodes with null show', async () => {
    const episode: Episode = {
      id: 999,
      name: 'Ep',
      season: 1,
      number: 1,
      airdate: '2024-01-01',
      airtime: '21:00',
      runtime: 60,
      summary: null,
      image: null,
      show: undefined,
    }
    vi.mocked(api.tvmazeApi.getShows).mockResolvedValue([episode])

    const { shows: showsRef } = useComposable(() => useShowList({ type: 'schedule' }))
    await nextTick()
    await nextTick()
    expect(showsRef.value).toHaveLength(0)
  })

  it('sets error on fetch failure', async () => {
    vi.mocked(api.tvmazeApi.getShows).mockRejectedValue(new Error('API down'))

    const { error, isLoading } = useComposable(() => useShowList({ type: 'schedule' }))
    await nextTick()
    await nextTick()
    expect(error.value).toBe('API down')
    expect(isLoading.value).toBe(false)
  })
})
