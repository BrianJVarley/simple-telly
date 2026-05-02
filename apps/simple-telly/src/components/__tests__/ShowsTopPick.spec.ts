import { describe, expect, it, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ShowsTopPick from '../ShowsHome/ShowsTopPick.vue'
import type { Show } from '@/types/tvShowModel'

function makeShow(overrides: Partial<Show> = {}): Show {
  return {
    id: 7,
    name: 'Top Pick Show',
    type: 'Scripted',
    language: 'English',
    schedule: { time: '21:00', days: ['Monday'] },
    genres: ['Drama'],
    status: 'Running',
    rating: { average: 8.8 },
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

describe('ShowsTopPick', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the banner heading and show image', () => {
    const wrapper = mount(ShowsTopPick, {
      props: { show: makeShow() },
      global: { directives: { tooltip: {} } },
    })

    expect(wrapper.text()).toContain('Pick of the day')
    expect(wrapper.find('img').attributes('src')).toBe('https://example.com/original.jpg')
  })

  it('falls back to the placeholder image when original image is missing', () => {
    const wrapper = mount(ShowsTopPick, {
      props: { show: makeShow({ image: null }) },
      global: { directives: { tooltip: {} } },
    })

    expect(wrapper.find('img').attributes('src')).toBe('/images/show-placeholder-404.svg')
  })

  it('navigates to the show details page when the image is clicked', async () => {
    const wrapper = mount(ShowsTopPick, {
      props: { show: makeShow({ id: 42 }) },
      global: { directives: { tooltip: {} } },
    })

    await wrapper.find('img').trigger('click')

    expect(wrapper.emitted('select')).toContainEqual([42])
  })

  it('navigates to the show details page with keyboard activation', async () => {
    const wrapper = mount(ShowsTopPick, {
      props: { show: makeShow({ id: 99 }) },
      global: { directives: { tooltip: {} } },
    })

    await wrapper.find('img').trigger('keydown.enter')
    await wrapper.find('img').trigger('keydown.space')

    expect(wrapper.emitted('select')).toContainEqual([99])
  })

  it('renders nothing when the show prop is missing', () => {
    const wrapper = mount(ShowsTopPick, {
      props: { show: undefined },
      global: { directives: { tooltip: {} } },
    })

    expect(wrapper.html()).toBe('<!--v-if-->')
  })
})
