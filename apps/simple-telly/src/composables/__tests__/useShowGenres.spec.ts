import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, nextTick } from 'vue'
import { useShowGenres } from '../useShowGenres'
import { useShowsStore } from '@/stores/shows'
import type { Show } from '@/types/tvShowModel'

vi.mock('@/stores/shows', () => ({
  useShowsStore: vi.fn(),
}))

const mockedUseShowsStore = vi.mocked(useShowsStore)

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
  mount(Wrapper)
  return result
}

describe('useShowGenres', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns a list of shows genres', async () => {
    const shows = [makeShow(1, 'Drama', 9.0), makeShow(2, 'Comedy', 7.0)]

    mockedUseShowsStore.mockReturnValue({
      all: shows,
      getById: vi.fn(),
      upsert: vi.fn(),
      upsertMany: vi.fn(),
      clear: vi.fn(),
    } as unknown as ReturnType<typeof useShowsStore>)

    const { genres, totalCount } = useComposable(() => useShowGenres())
    await nextTick()

    expect(genres.value).toHaveLength(2)
    expect(totalCount.value).toBe(2)
  })
})
