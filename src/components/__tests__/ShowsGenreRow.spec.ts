import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import ShowsGenreRow from '../ShowsGenreRow.vue'
import type { Show } from '@/types/tvShowModel'

// ── hoisted mock fns ─────────────────────────────────────────────────────────
const mockRouterPush = vi.hoisted(() => vi.fn())
const scrollLeftMock = vi.hoisted(() => vi.fn())
const scrollRightMock = vi.hoisted(() => vi.fn())
const useHScrollMock = vi.hoisted(() => vi.fn())

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockRouterPush }),
}))

vi.mock('@/composables/useHorizontalScroll', () => ({
  useHorizontalScroll: useHScrollMock,
}))

// ── helpers ───────────────────────────────────────────────────────────────────
const makeShow = (overrides: Partial<Show> = {}): Show => ({
  id: 1,
  name: 'Test Show',
  type: 'Scripted',
  language: 'English',
  genres: ['Drama'],
  status: 'Running',
  rating: { average: 8.0 },
  network: null,
  summary: null,
  image: { medium: 'http://test.jpg', original: 'http://test.jpg' },
  premiered: null,
  officialSite: null,
  ...overrides,
})

function mkWrapper(genre = 'Drama', shows: Show[] = [makeShow()]) {
  return mount(ShowsGenreRow, {
    props: { genre, shows },
    global: {
      directives: { tooltip: {} },
    },
  })
}

// ── tests ─────────────────────────────────────────────────────────────────────
describe('ShowsGenreRow', () => {
  function mockHScroll(canLeft = false, canRight = true) {
    useHScrollMock.mockReturnValue({
      canScrollLeft: ref(canLeft),
      canScrollRight: ref(canRight),
      scrollLeft: scrollLeftMock,
      scrollRight: scrollRightMock,
      updateScrollState: vi.fn(),
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockHScroll()
  })

  it('renders the genre heading', () => {
    const wrapper = mkWrapper('Action')
    expect(wrapper.find('h2').text()).toBe('Action')
  })

  it('renders one card per show', () => {
    const shows = [makeShow({ id: 1 }), makeShow({ id: 2, name: 'Another Show' })]
    const wrapper = mkWrapper('Drama', shows)
    expect(wrapper.findAll('[role="listitem"]').length).toBe(2)
  })

  it('renders show names', () => {
    const wrapper = mkWrapper('Drama', [makeShow({ name: 'Breaking Bad' })])
    expect(wrapper.text()).toContain('Breaking Bad')
  })

  it('renders show image with correct src and alt', () => {
    const wrapper = mkWrapper()
    const img = wrapper.find('img')
    expect(img.attributes('src')).toBe('http://test.jpg')
    expect(img.attributes('alt')).toBe('Test Show')
  })

  it('renders the rating value', () => {
    const wrapper = mkWrapper('Drama', [makeShow({ rating: { average: 8.5 } })])
    expect(wrapper.text()).toContain('8.5')
  })

  it('renders — when rating is null', () => {
    const wrapper = mkWrapper('Drama', [makeShow({ rating: { average: null } })])
    expect(wrapper.text()).toContain('—')
  })

  it('shows top-rated star for shows with rating >= 7.5', () => {
    const wrapper = mkWrapper('Drama', [makeShow({ rating: { average: 8.0 } })])
    expect(wrapper.text()).toContain('⭐')
  })

  it('shows star for rating exactly 7.5', () => {
    const wrapper = mkWrapper('Drama', [makeShow({ rating: { average: 7.5 } })])
    expect(wrapper.text()).toContain('⭐')
  })

  it('does not show star for rating below 7.5', () => {
    const wrapper = mkWrapper('Drama', [makeShow({ rating: { average: 7.4 } })])
    expect(wrapper.text()).not.toContain('⭐')
  })

  it('does not show star when rating is null', () => {
    const wrapper = mkWrapper('Drama', [makeShow({ rating: { average: null } })])
    expect(wrapper.text()).not.toContain('⭐')
  })

  it('navigates to show details on card click', async () => {
    const wrapper = mkWrapper('Drama', [makeShow({ id: 42 })])
    await wrapper.find('[role="listitem"]').trigger('click')
    expect(mockRouterPush).toHaveBeenCalledWith({ name: 'show-details', params: { id: 42 } })
  })

  it('navigates to show details on Enter key', async () => {
    const wrapper = mkWrapper('Drama', [makeShow({ id: 99 })])
    await wrapper.find('[role="listitem"]').trigger('keydown', { key: 'Enter' })
    expect(mockRouterPush).toHaveBeenCalledWith({ name: 'show-details', params: { id: 99 } })
  })

  it('left scroll button is disabled when canScrollLeft is false', () => {
    mockHScroll(false)
    const wrapper = mkWrapper()
    const btn = wrapper.find('[aria-label*="left"]').element as HTMLButtonElement
    expect(btn.disabled).toBe(true)
  })

  it('left scroll button is enabled when canScrollLeft is true', () => {
    mockHScroll(true)
    const wrapper = mkWrapper()
    const btn = wrapper.find('[aria-label*="left"]').element as HTMLButtonElement
    expect(btn.disabled).toBe(false)
  })

  it('right scroll button is enabled when canScrollRight is true', () => {
    mockHScroll(false, true)
    const wrapper = mkWrapper()
    const btn = wrapper.find('[aria-label*="right"]').element as HTMLButtonElement
    expect(btn.disabled).toBe(false)
  })

  it('right scroll button is disabled when canScrollRight is false', () => {
    mockHScroll(false, false)
    const wrapper = mkWrapper()
    const btn = wrapper.find('[aria-label*="right"]').element as HTMLButtonElement
    expect(btn.disabled).toBe(true)
  })

  it('calls scrollLeft when left arrow is clicked', async () => {
    mockHScroll(true)
    const wrapper = mkWrapper()
    await wrapper.find('[aria-label*="left"]').trigger('click')
    expect(scrollLeftMock).toHaveBeenCalled()
  })

  it('calls scrollRight when right arrow is clicked', async () => {
    const wrapper = mkWrapper()
    await wrapper.find('[aria-label*="right"]').trigger('click')
    expect(scrollRightMock).toHaveBeenCalled()
  })

  it('scroll buttons use the genre name in aria-labels', () => {
    const wrapper = mkWrapper('Thriller')
    expect(wrapper.find('[aria-label*="Thriller"][aria-label*="left"]').exists()).toBe(true)
    expect(wrapper.find('[aria-label*="Thriller"][aria-label*="right"]').exists()).toBe(true)
  })

  it('renders an empty list when shows prop is empty', () => {
    const wrapper = mkWrapper('Drama', [])
    expect(wrapper.findAll('[role="listitem"]').length).toBe(0)
  })
})
