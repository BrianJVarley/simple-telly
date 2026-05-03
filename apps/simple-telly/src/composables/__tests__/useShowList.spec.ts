import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { defineComponent, nextTick } from 'vue'
import { useShowList } from '../useShowList'
import * as api from '@/api/tvmaze-api'
import { ApiErrorTypes } from '@/types/apiErrorModel'
import type { Show } from '@/types/tvShowModel'

vi.mock('@/api/tvmaze-api')

function makeShow(id: number, genre: string, rating: number | null = 8.0): Show {
  return {
    id,
    name: `Show ${id}`,
    type: 'Scripted',
    language: 'English',
    schedule: { time: '21:00', days: ['Monday'] },
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

/**
 * Helper to mount a dummy component that calls the composable's setup function,
 * allowing us to test the composable in isolation.
 * @param setup
 * @returns
 */
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
    vi.mocked(api.tvmazeApi.getShows).mockResolvedValue(shows)

    const { shows: showsRef, isLoading } = useComposable(() => useShowList({ page: 0 }))

    expect(isLoading.value).toBe(true)
    await nextTick()
    await nextTick()
    expect(showsRef.value).toHaveLength(2)
    expect(isLoading.value).toBe(false)
  })

  it('preserves API order in shows for mobile rendering', async () => {
    const shows = [makeShow(1, 'Drama', 6.0), makeShow(2, 'Drama', 9.0), makeShow(3, 'Drama', 7.5)]
    vi.mocked(api.tvmazeApi.getShows).mockResolvedValue(shows)

    const { shows: showsRef } = useComposable(() => useShowList({ page: 0 }))
    await nextTick()
    await nextTick()
    expect(showsRef.value.map((show) => show.id)).toEqual([1, 2, 3])
  })

  it('sorts shows by rating descending within genre groups', async () => {
    const shows = [makeShow(1, 'Drama', 6.0), makeShow(2, 'Drama', 9.0), makeShow(3, 'Drama', 7.5)]
    vi.mocked(api.tvmazeApi.getShows).mockResolvedValue(shows)

    const { showsSortedByGenre } = useComposable(() => useShowList({ page: 0 }))
    await nextTick()
    await nextTick()
    expect(showsSortedByGenre.value.get('Drama')?.map((show) => show.id)).toEqual([2, 3, 1])
  })

  it('selects the highest rated show as the top pick', async () => {
    const shows = [makeShow(1, 'Drama', 6.0), makeShow(2, 'Drama', 9.0), makeShow(3, 'Comedy', 7.5)]
    vi.mocked(api.tvmazeApi.getShows).mockResolvedValue(shows)

    const { showsTopPick } = useComposable(() => useShowList({ page: 0 }))
    await nextTick()
    await nextTick()

    expect(showsTopPick.value?.id).toBe(2)
  })

  it('prefers rated shows over null ratings when selecting the top pick', async () => {
    const shows = [
      makeShow(1, 'Drama', null),
      makeShow(2, 'Drama', 8.5),
      makeShow(3, 'Comedy', 7.5),
    ]
    vi.mocked(api.tvmazeApi.getShows).mockResolvedValue(shows)

    const { showsTopPick } = useComposable(() => useShowList({ page: 0 }))
    await nextTick()
    await nextTick()

    expect(showsTopPick.value?.id).toBe(2)
  })

  it('returns null for the top pick when no shows are loaded', async () => {
    vi.mocked(api.tvmazeApi.getShows).mockResolvedValue([])

    const { showsTopPick } = useComposable(() => useShowList({ page: 0 }))
    await nextTick()
    await nextTick()

    expect(showsTopPick.value).toBe(null)
  })

  it('sorts null ratings to the bottom within genre groups', async () => {
    const shows = [
      makeShow(1, 'Drama', null),
      makeShow(2, 'Drama', 8.5),
      makeShow(3, 'Drama', 5.0),
      makeShow(4, 'Drama', null),
    ]
    vi.mocked(api.tvmazeApi.getShows).mockResolvedValue(shows)

    const { showsSortedByGenre } = useComposable(() => useShowList({ page: 0 }))
    await nextTick()
    await nextTick()
    expect(showsSortedByGenre.value.get('Drama')?.map((show) => show.id)).toEqual([2, 3, 1, 4])
  })

  it('groups shows by first genre in showsSortedByGenre', async () => {
    const shows = [makeShow(1, 'Drama'), makeShow(2, 'Comedy'), makeShow(3, 'Drama')]
    vi.mocked(api.tvmazeApi.getShows).mockResolvedValue(shows)

    const { showsSortedByGenre } = useComposable(() => useShowList({ page: 0 }))
    await nextTick()
    await nextTick()
    expect(showsSortedByGenre.value.get('Drama')).toHaveLength(2)
    expect(showsSortedByGenre.value.get('Comedy')).toHaveLength(1)
  })

  it('filters shows data by given genre', async () => {
    const shows = [makeShow(1, 'Drama'), makeShow(2, 'Comedy'), makeShow(3, 'Drama')]
    vi.mocked(api.tvmazeApi.getShows).mockResolvedValue(shows)

    const { filterShowsByGenre, shows: showsRef } = useComposable(() => useShowList({ page: 0 }))
    await nextTick()
    await nextTick()

    filterShowsByGenre('Drama')
    await nextTick()

    expect(showsRef.value).toHaveLength(2)
    expect(showsRef.value.every((show) => show.genres.includes('Drama'))).toBe(true)
  })

  it('preserves available genre filters across repeated filtering', async () => {
    const shows = [makeShow(1, 'Drama'), makeShow(2, 'Comedy'), makeShow(3, 'Drama')]
    vi.mocked(api.tvmazeApi.getShows).mockResolvedValue(shows)

    const {
      filterShowsByGenre,
      shows: showsRef,
      showsSortedByGenre,
    } = useComposable(() => useShowList({ page: 0 }))

    await nextTick()
    await nextTick()

    // Filter to Drama first, then to Comedy — each should show only that genre's map entry
    filterShowsByGenre('Drama')
    await nextTick()
    expect(showsSortedByGenre.value.has('Drama')).toBe(true)
    expect(showsSortedByGenre.value.has('Comedy')).toBe(false)

    filterShowsByGenre('Comedy')
    await nextTick()
    expect(showsRef.value).toHaveLength(1)
    expect(showsRef.value[0]?.genres).toContain('Comedy')
    expect(showsSortedByGenre.value.has('Comedy')).toBe(true)
    expect(showsSortedByGenre.value.has('Drama')).toBe(false)

    // Clearing with All should restore both genres
    filterShowsByGenre('All')
    await nextTick()
    expect(showsSortedByGenre.value.has('Drama')).toBe(true)
    expect(showsSortedByGenre.value.has('Comedy')).toBe(true)
  })

  it('return show genres list', async () => {
    const shows = [makeShow(1, 'Drama'), makeShow(2, 'Comedy'), makeShow(3, 'Drama')]
    vi.mocked(api.tvmazeApi.getShows).mockResolvedValue(shows)

    const { showGenres } = useComposable(() => useShowList({ page: 0 }))
    await nextTick()
    await nextTick()
    expect(showGenres.value).toContain('Drama')
    expect(showGenres.value).toContain('Comedy')
  })

  it('falls back to "Other" for shows with no genres', async () => {
    const show = makeShow(1, '')
    show.genres = []
    vi.mocked(api.tvmazeApi.getShows).mockResolvedValue([show])

    const { showsSortedByGenre } = useComposable(() => useShowList({ page: 0 }))
    await nextTick()
    await nextTick()
    expect(showsSortedByGenre.value.has('Other')).toBe(true)
  })

  it('appends the next page without reordering the existing mobile list', async () => {
    vi.mocked(api.tvmazeApi.getShows)
      .mockResolvedValueOnce([makeShow(1, 'Drama', 9.0), makeShow(2, 'Comedy', 7.0)])
      .mockResolvedValueOnce([makeShow(3, 'Drama', 8.5), makeShow(4, 'Comedy', 6.5)])

    const {
      shows: showsRef,
      appendNextPage,
      currentPage,
      isAccumulated,
    } = useComposable(() => useShowList({ page: 0 }))

    await nextTick()
    await nextTick()
    await appendNextPage()
    await nextTick()

    expect(showsRef.value.map((show) => show.id)).toEqual([1, 2, 3, 4])
    expect(currentPage.value).toBe(1)
    expect(isAccumulated.value).toBe(true)
  })

  it('moves forward by a relative number of pages with goToPage', async () => {
    vi.mocked(api.tvmazeApi.getShows)
      .mockResolvedValueOnce([makeShow(1, 'Drama', 9.0)])
      .mockResolvedValueOnce([makeShow(2, 'Comedy', 7.0)])

    const { goToPage, currentPage } = useComposable(() => useShowList({ page: 0 }))

    await nextTick()
    await nextTick()
    await goToPage(1)
    await nextTick()

    expect(currentPage.value).toBe(1)
    expect(vi.mocked(api.tvmazeApi.getShows)).toHaveBeenLastCalledWith(1)
  })

  it('converts negative goToPage offsets to zero', async () => {
    vi.mocked(api.tvmazeApi.getShows)
      .mockResolvedValueOnce([makeShow(1, 'Drama', 9.0)])
      .mockResolvedValueOnce([makeShow(1, 'Drama', 9.0)])

    const { goToPage, currentPage } = useComposable(() => useShowList({ page: 0 }))

    await nextTick()
    await nextTick()
    await goToPage(-5)
    await nextTick()

    expect(currentPage.value).toBe(0)
    expect(vi.mocked(api.tvmazeApi.getShows)).toHaveBeenLastCalledWith(0)
  })

  it('sets error on fetch failure', async () => {
    vi.mocked(api.tvmazeApi.getShows).mockRejectedValue(new Error('API down'))

    const { error, isLoading } = useComposable(() => useShowList({ page: 0 }))
    await nextTick()
    await nextTick()
    expect(error.value).toEqual({ message: 'API down', cause: undefined })
    expect(isLoading.value).toBe(false)
  })

  it('marks the end of the list without surfacing an error when append reaches 404', async () => {
    const notFoundError = new Error('Page not found: 404 Not Found')
    Object.defineProperty(notFoundError, 'cause', {
      value: ApiErrorTypes['Not Found'],
      configurable: true,
    })

    vi.mocked(api.tvmazeApi.getShows)
      .mockResolvedValueOnce([makeShow(1, 'Drama', 9.0)])
      .mockRejectedValueOnce(notFoundError)

    const { appendNextPage, error, hasMorePages, currentPage, isLoading } = useComposable(() =>
      useShowList({ page: 0 }),
    )

    await nextTick()
    await nextTick()
    await appendNextPage()
    await nextTick()

    expect(error.value).toBe(null)
    expect(hasMorePages.value).toBe(false)
    expect(currentPage.value).toBe(0)
    expect(isLoading.value).toBe(false)
  })

  it('showsSortedByGenre scopes to only the active genre after filtering', async () => {
    const shows = [makeShow(1, 'Drama'), makeShow(2, 'Comedy'), makeShow(3, 'Drama')]
    vi.mocked(api.tvmazeApi.getShows).mockResolvedValue(shows)

    const { filterShowsByGenre, showsSortedByGenre } = useComposable(() => useShowList({ page: 0 }))
    await nextTick()
    await nextTick()

    filterShowsByGenre('Drama')
    await nextTick()

    expect(showsSortedByGenre.value.has('Drama')).toBe(true)
    expect(showsSortedByGenre.value.has('Comedy')).toBe(false)
    expect(showsSortedByGenre.value.get('Drama')).toHaveLength(2)
  })

  it('showsSortedByGenre restores the full map when All is selected', async () => {
    const shows = [makeShow(1, 'Drama'), makeShow(2, 'Comedy')]
    vi.mocked(api.tvmazeApi.getShows).mockResolvedValue(shows)

    const { filterShowsByGenre, showsSortedByGenre } = useComposable(() => useShowList({ page: 0 }))
    await nextTick()
    await nextTick()

    filterShowsByGenre('Drama')
    await nextTick()
    filterShowsByGenre('All')
    await nextTick()

    expect(showsSortedByGenre.value.has('Drama')).toBe(true)
    expect(showsSortedByGenre.value.has('Comedy')).toBe(true)
  })

  it('does not mutate shows when filtering by an unknown genre', async () => {
    const shows = [makeShow(1, 'Drama'), makeShow(2, 'Comedy')]
    vi.mocked(api.tvmazeApi.getShows).mockResolvedValue(shows)

    const { filterShowsByGenre, shows: showsRef } = useComposable(() => useShowList({ page: 0 }))
    await nextTick()
    await nextTick()

    const countBefore = showsRef.value.length
    filterShowsByGenre('SciFi')
    await nextTick()

    expect(showsRef.value.length).toBe(countBefore)
  })
})
