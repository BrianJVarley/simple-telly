import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { defineComponent, nextTick } from 'vue'
import { useShowDetail } from '../useShowDetail'
import * as api from '@/api/tvmaze-api'
import type { Show, Episode } from '@/types/tvShowModel'

vi.mock('@/api/tvmaze-api')

function makeShow(id = 1): Show {
  return {
    id,
    name: 'Test Show',
    type: 'Scripted',
    language: 'English',
    genres: ['Drama'],
    schedule: { time: '21:00', days: ['Monday'] },
    status: 'Running',
    rating: { average: 8.5 },
    network: null,
    summary: '<p>A great show</p>',
    image: { medium: 'http://img.com/m.jpg', original: 'http://img.com/o.jpg' },
    premiered: '2010-01-01',
    officialSite: null,
  }
}

function makeEpisode(id: number, season: number, number: number): Episode {
  return {
    id,
    name: `Episode ${id}`,
    season,
    number,
    airdate: '2010-01-10',
    airtime: '21:00',
    runtime: 60,
    summary: null,
    image: null,
  }
}

// Helper to use a composable in a component context
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

describe('useShowDetail', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('fetches show and episodes on mount', async () => {
    const show = makeShow()
    const episodes = [makeEpisode(1, 1, 1), makeEpisode(2, 1, 2)]
    vi.mocked(api.tvmazeApi.getShow).mockResolvedValue(show)
    vi.mocked(api.tvmazeApi.getShowEpisodes).mockResolvedValue(episodes)

    const {
      show: showRef,
      episodes: episodesRef,
      isLoading,
    } = useComposable(() => useShowDetail(1))

    expect(isLoading.value).toBe(true)
    await nextTick()
    await nextTick()
    expect(showRef.value?.name).toBe('Test Show')
    expect(episodesRef.value).toHaveLength(2)
  })


  it('computes seasonCount correctly', async () => {
    const show = makeShow()
    const episodes = [makeEpisode(1, 1, 1), makeEpisode(2, 1, 2), makeEpisode(3, 2, 1)]
    vi.mocked(api.tvmazeApi.getShow).mockResolvedValue(show)
    vi.mocked(api.tvmazeApi.getShowEpisodes).mockResolvedValue(episodes)

    const { seasonCount } = useComposable(() => useShowDetail(1))
    await nextTick()
    await nextTick()
    expect(seasonCount.value).toBe(2)
  })

  it('episodesBySeason groups correctly', async () => {
    const show = makeShow()
    const episodes = [makeEpisode(1, 1, 1), makeEpisode(2, 2, 1), makeEpisode(3, 2, 2)]
    vi.mocked(api.tvmazeApi.getShow).mockResolvedValue(show)
    vi.mocked(api.tvmazeApi.getShowEpisodes).mockResolvedValue(episodes)

    const { episodesBySeason } = useComposable(() => useShowDetail(1))
    await nextTick()
    await nextTick()
    const map = episodesBySeason()
    expect(map.get(1)).toHaveLength(1)
    expect(map.get(2)).toHaveLength(2)
  })
})
