import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ShowsMobileList from '../ShowsHome/ShowsMobileList.vue'
import type { Show, ShowsByGenre } from '@/types/tvShowModel'

function makeShow(id: number, genre: string, overrides: Partial<Show> = {}): Show {
  return {
    id,
    name: `Show ${id}`,
    type: 'Scripted',
    language: 'English',
    schedule: { time: '21:00', days: ['Monday'] },
    genres: [genre],
    status: 'Running',
    rating: { average: 8.0 },
    network: null,
    summary: null,
    image: {
      medium: 'https://example.com/medium.jpg',
      original: 'https://example.com/original.jpg',
    },
    premiered: null,
    officialSite: null,
    ...overrides,
  }
}

function makeShowsByGenre(): ShowsByGenre {
  return new Map([
    ['Comedy', [makeShow(1, 'Comedy')]],
    ['Drama', [makeShow(2, 'Drama'), makeShow(3, 'Drama')]],
  ])
}

describe('ShowsMobileList', () => {
  it('renders a genre header before each group of shows', () => {
    const wrapper = mount(ShowsMobileList, {
      props: {
        shows: makeShowsByGenre(),
        isLoading: false,
        error: null,
        totalShows: 3,
      },
      global: { directives: { tooltip: {} } },
    })

    const headings = wrapper.findAll('[role="heading"]')
    const items = wrapper.findAll('[role="listitem"]')

    expect(headings).toHaveLength(2)
    expect(headings[0]!.text()).toContain('Comedy')
    expect(headings[1]!.text()).toContain('Drama')
    expect(items).toHaveLength(3)
  })

  it('emits nextPage when the scroller reaches the end of the list', async () => {
    const wrapper = mount(ShowsMobileList, {
      props: {
        shows: makeShowsByGenre(),
        isLoading: false,
        error: null,
        totalShows: 3,
      },
      global: { directives: { tooltip: {} } },
    })

    const container = wrapper.get('[role="region"]')

    Object.defineProperty(container.element, 'scrollTop', { configurable: true, value: 350 })
    Object.defineProperty(container.element, 'clientHeight', { configurable: true, value: 200 })
    Object.defineProperty(container.element, 'scrollHeight', { configurable: true, value: 600 })

    await container.trigger('scroll')

    expect(wrapper.emitted('nextPage')).toHaveLength(1)
  })
})
