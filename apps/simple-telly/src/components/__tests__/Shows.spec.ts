import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { ref, computed } from 'vue'
import ShowsHome from '../ShowsHome/ShowsHome.vue'
import type { Show, SearchResult } from '@/types/tvShowModel'

// ── hoisted mock fns ──────────────────────────────────────────────────────────
const mockSearch = vi.hoisted(() => vi.fn())
const mockClear = vi.hoisted(() => vi.fn())
const mockRouterPush = vi.hoisted(() => vi.fn())
const mockRouterReplace = vi.hoisted(() => vi.fn())
const useShowSearchMock = vi.hoisted(() => vi.fn())
const useShowListMock = vi.hoisted(() => vi.fn())
const useBreakpointsMock = vi.hoisted(() => vi.fn())

let mockRouteQueryValue: Record<string, string> = {}

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockRouterPush, replace: mockRouterReplace }),
  useRoute: () => ({ query: mockRouteQueryValue, name: 'home' }),
}))

vi.mock('@/composables/useShowSearch', () => ({
  useShowSearch: useShowSearchMock,
}))

vi.mock('@/composables/useShowList', () => ({
  useShowList: useShowListMock,
}))

vi.mock('@heroicons/vue/24/outline', () => ({
  MagnifyingGlassCircleIcon: { template: '<span class="icon-stub"></span>' },
  ExclamationTriangleIcon: { template: '<span class="error-icon-stub"></span>' },
  ArrowPathIcon: { template: '<span class="retry-icon-stub"></span>' },
  StarIcon: { template: '<span class="star-icon-stub"></span>' },
  FunnelIcon: { template: '<span class="funnel-icon-stub"></span>' },
}))

vi.mock('@vueuse/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@vueuse/core')>()
  return {
    ...actual,
    useBreakpoints: useBreakpointsMock,
  }
})

// ── helpers ───────────────────────────────────────────────────────────────────
const makeShow = (overrides: Partial<Show> = {}): Show => ({
  id: 1,
  name: 'Test Show',
  type: 'Scripted',
  language: 'English',
  schedule: { time: '21:00', days: ['Monday'] },
  genres: ['Drama'],
  status: 'Running',
  rating: { average: 8.0 },
  network: null,
  summary: null,
  image: { medium: 'http://img.jpg', original: 'http://img.jpg' },
  premiered: null,
  officialSite: null,
  ...overrides,
})

function mkWrapper() {
  return mount(ShowsHome, {
    global: {
      plugins: [createPinia()],
      directives: { tooltip: {} },
      stubs: {
        ShowsGenreRow: { template: '<div class="genre-row-stub"></div>' },
        Transition: true,
      },
    },
  })
}

function makeUseShowListReturn(overrides: Record<string, unknown> = {}) {
  return {
    shows: computed(() => []),
    showsTopPick: computed(() => null),
    showsSortedByGenre: ref(new Map()),
    showGenres: ref<string[]>([]),
    filterShowsByGenre: vi.fn(),
    currentPage: ref(1),
    hasMorePages: ref(true),
    isAccumulated: ref(false),
    totalShows: computed(() => 0),
    nextPage: vi.fn(),
    appendNextPage: vi.fn(),
    previousPage: vi.fn(),
    goToFirstPage: vi.fn(),
    goToPage: vi.fn(),
    loadPage: vi.fn(),
    isLoading: ref(false),
    error: ref(null),
    refresh: vi.fn(),
    ...overrides,
  }
}

// ── tests ─────────────────────────────────────────────────────────────────────
describe('ShowsHome', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRouteQueryValue = {}
    useBreakpointsMock.mockReturnValue({
      smaller: vi.fn(() => ref(false)),
    })
    useShowSearchMock.mockReturnValue({
      results: ref([]),
      isLoading: ref(false),
      error: ref(null),
      search: mockSearch,
      clear: mockClear,
    })
    useShowListMock.mockReturnValue(makeUseShowListReturn())
  })

  it('renders the search toggle icon', () => {
    const wrapper = mkWrapper()
    expect(wrapper.find('.icon-stub').exists()).toBe(true)
  })

  it('hides search input by default', () => {
    const wrapper = mkWrapper()
    expect(wrapper.find('input[type="search"]').exists()).toBe(false)
  })

  it('shows search input after clicking the search icon', async () => {
    const wrapper = mkWrapper()
    await wrapper.find('.icon-stub').trigger('click')
    expect(wrapper.find('input[type="search"]').exists()).toBe(true)
  })

  it('hides search input on second icon click', async () => {
    const wrapper = mkWrapper()
    await wrapper.find('.icon-stub').trigger('click')
    await wrapper.find('.icon-stub').trigger('click')
    expect(wrapper.find('input[type="search"]').exists()).toBe(false)
  })

  it('calls search() when query is typed', async () => {
    const wrapper = mkWrapper()
    await wrapper.find('.icon-stub').trigger('click')
    await wrapper.find('input[type="search"]').setValue('Breaking Bad')
    expect(mockSearch).toHaveBeenCalledWith('Breaking Bad')
  })

  it('does not show clear button when query is empty', async () => {
    const wrapper = mkWrapper()
    await wrapper.find('.icon-stub').trigger('click')
    expect(wrapper.find('[aria-label="Clear search"]').exists()).toBe(false)
  })

  it('shows clear button when a query is entered', async () => {
    const wrapper = mkWrapper()
    await wrapper.find('.icon-stub').trigger('click')
    await wrapper.find('input[type="search"]').setValue('test')
    expect(wrapper.find('[aria-label="Clear search"]').exists()).toBe(true)
  })

  it('calls clear() and resets input when clear button clicked', async () => {
    const wrapper = mkWrapper()
    await wrapper.find('.icon-stub').trigger('click')
    await wrapper.find('input[type="search"]').setValue('test')
    await wrapper.find('[aria-label="Clear search"]').trigger('click')
    expect(mockClear).toHaveBeenCalled()
    expect((wrapper.find('input[type="search"]').element as HTMLInputElement).value).toBe('')
  })

  it('renders one genre row per entry in showsSortedByGenre', () => {
    const show = makeShow()
    useShowListMock.mockReturnValue(
      makeUseShowListReturn({
        shows: computed(() => [show]),
        showsSortedByGenre: ref(
          new Map([
            ['Drama', [show]],
            ['Action', [show]],
          ]),
        ),
        currentPage: ref(1),
      }),
    )
    const wrapper = mkWrapper()
    expect(wrapper.findAll('.genre-row-stub').length).toBe(2)
  })

  it('shows loading state for show list', () => {
    useShowListMock.mockReturnValue(
      makeUseShowListReturn({
        isLoading: ref(true),
      }),
    )
    const wrapper = mkWrapper()
    expect(wrapper.text()).toContain('Loading shows...')
  })

  it('keeps rendered rows visible while loading another page', () => {
    const show = makeShow()
    useShowListMock.mockReturnValue(
      makeUseShowListReturn({
        shows: computed(() => [show]),
        showsSortedByGenre: ref(new Map([['Drama', [show]]])),
        currentPage: ref(2),
        isLoading: ref(true),
      }),
    )
    const wrapper = mkWrapper()
    expect(wrapper.text()).toContain('Loading shows...')
    expect(wrapper.findAll('.genre-row-stub')).toHaveLength(1)
  })

  it('shows error state for show list', () => {
    useShowListMock.mockReturnValue(
      makeUseShowListReturn({
        error: ref({ message: 'Network error' }),
      }),
    )
    const wrapper = mkWrapper()
    expect(wrapper.text()).toContain('Network error')
  })

  it('renders the top-pick banner on desktop when there is no active query', () => {
    const show = makeShow({ id: 12, name: 'Top Pick Banner' })
    useShowListMock.mockReturnValue(
      makeUseShowListReturn({
        shows: computed(() => [show]),
        showsTopPick: computed(() => show),
        showsSortedByGenre: ref(new Map([['Drama', [show]]])),
      }),
    )

    const wrapper = mkWrapper()

    expect(wrapper.text()).toContain('Pick of the day')
    expect(wrapper.find('[aria-label="Pick of the day show Top Pick Banner"]').exists()).toBe(true)
  })

  it('hides the top-pick banner on mobile breakpoints', () => {
    useBreakpointsMock.mockReturnValue({
      smaller: vi.fn(() => ref(true)),
    })

    const show = makeShow({ id: 12, name: 'Top Pick Banner' })
    useShowListMock.mockReturnValue(
      makeUseShowListReturn({
        shows: computed(() => [show]),
        showsTopPick: computed(() => show),
        showsSortedByGenre: ref(new Map([['Drama', [show]]])),
      }),
    )

    const wrapper = mkWrapper()

    expect(wrapper.text()).not.toContain('Pick of the day')
  })

  it('hides the top-pick banner when a search query is active', async () => {
    const show = makeShow({ id: 12, name: 'Top Pick Banner' })
    useShowListMock.mockReturnValue(
      makeUseShowListReturn({
        shows: computed(() => [show]),
        showsTopPick: computed(() => show),
        showsSortedByGenre: ref(new Map([['Drama', [show]]])),
      }),
    )

    const wrapper = mkWrapper()

    await wrapper.find('.icon-stub').trigger('click')
    await wrapper.find('input[type="search"]').setValue('Banner')

    expect(wrapper.text()).not.toContain('Pick of the day')
  })

  it('shows search results when query is present and results exist', async () => {
    const show = makeShow({ id: 42, name: 'Searched Show' })
    useShowSearchMock.mockReturnValue({
      results: ref([{ score: 0.9, show }] as SearchResult[]),
      isLoading: ref(false),
      error: ref(null),
      search: mockSearch,
      clear: mockClear,
    })
    const wrapper = mkWrapper()
    await wrapper.find('.icon-stub').trigger('click')
    await wrapper.find('input[type="search"]').setValue('Searched')
    expect(wrapper.text()).toContain('Searched Show')
  })

  it('announces the search result count in a live region', async () => {
    const show = makeShow({ id: 42, name: 'Searched Show' })
    useShowSearchMock.mockReturnValue({
      results: ref([{ score: 0.9, show }] as SearchResult[]),
      isLoading: ref(false),
      error: ref(null),
      search: mockSearch,
      clear: mockClear,
    })
    const wrapper = mkWrapper()

    await wrapper.find('.icon-stub').trigger('click')
    await wrapper.find('input[type="search"]').setValue('Searched')

    const status = wrapper.find('[role="status"]')
    expect(status.exists()).toBe(true)
    expect(status.text()).toContain('1 show found for search Searched.')
  })

  it('shows "no results" message when query is set but results are empty', async () => {
    const wrapper = mkWrapper()
    await wrapper.find('.icon-stub').trigger('click')
    await wrapper.find('input[type="search"]').setValue('nothing')
    expect(wrapper.text()).toContain('No results for')
  })

  it('shows "Searching..." while search is loading', async () => {
    useShowSearchMock.mockReturnValue({
      results: ref([]),
      isLoading: ref(true),
      error: ref(null),
      search: mockSearch,
      clear: mockClear,
    })
    const wrapper = mkWrapper()
    await wrapper.find('.icon-stub').trigger('click')
    await wrapper.find('input[type="search"]').setValue('test')
    expect(wrapper.text()).toContain('Searching...')
  })

  it('shows search error message', async () => {
    useShowSearchMock.mockReturnValue({
      results: ref([]),
      isLoading: ref(false),
      error: ref('Search failed'),
      search: mockSearch,
      clear: mockClear,
    })
    const wrapper = mkWrapper()
    await wrapper.find('.icon-stub').trigger('click')
    await wrapper.find('input[type="search"]').setValue('test')
    expect(wrapper.find('[role="alert"]').text()).toContain('Search failed')
  })

  it('navigates to show details when a search result is clicked', async () => {
    const show = makeShow({ id: 42 })
    useShowSearchMock.mockReturnValue({
      results: ref([{ score: 0.9, show }] as SearchResult[]),
      isLoading: ref(false),
      error: ref(null),
      search: mockSearch,
      clear: mockClear,
    })
    const wrapper = mkWrapper()
    await wrapper.find('.icon-stub').trigger('click')
    await wrapper.find('input[type="search"]').setValue('test')
    await wrapper.find('[role="listitem"]').trigger('click')
    expect(mockRouterPush).toHaveBeenCalledWith({
      name: 'show-details',
      params: { id: 42 },
      query: {},
    })
  })

  it('navigates to show details via Enter key on a search result', async () => {
    const show = makeShow({ id: 7 })
    useShowSearchMock.mockReturnValue({
      results: ref([{ score: 0.9, show }] as SearchResult[]),
      isLoading: ref(false),
      error: ref(null),
      search: mockSearch,
      clear: mockClear,
    })
    const wrapper = mkWrapper()
    await wrapper.find('.icon-stub').trigger('click')
    await wrapper.find('input[type="search"]').setValue('test')
    await wrapper.find('[role="listitem"]').trigger('keydown', { key: 'Enter' })
    expect(mockRouterPush).toHaveBeenCalledWith({
      name: 'show-details',
      params: { id: 7 },
      query: {},
    })
  })

  it('passes showGenres to the ShowFilterWidget genres prop', () => {
    const mockFilterFn = vi.fn()
    useShowListMock.mockReturnValue(
      makeUseShowListReturn({
        showGenres: ref(['Drama', 'Comedy', 'Action']),
        filterShowsByGenre: mockFilterFn,
      }),
    )
    const wrapper = mkWrapper()
    const filterWidget = wrapper.findComponent({ name: 'ShowFilterWidget' })
    expect(filterWidget.exists()).toBe(true)
    expect(filterWidget.props('genres')).toEqual(['Drama', 'Comedy', 'Action'])
  })

  it('calls filterShowsByGenre and replaces route with genre param on filter selection', async () => {
    const mockFilterFn = vi.fn()
    useShowListMock.mockReturnValue(
      makeUseShowListReturn({
        showGenres: ref(['Drama', 'Comedy']),
        filterShowsByGenre: mockFilterFn,
      }),
    )
    const wrapper = mkWrapper()
    const filterWidget = wrapper.findComponent({ name: 'ShowFilterWidget' })
    await filterWidget.vm.$emit('filterApplied', 'Drama')
    expect(mockFilterFn).toHaveBeenCalledWith('Drama')
    expect(mockRouterReplace).toHaveBeenCalledWith(
      expect.objectContaining({ query: expect.objectContaining({ genre: 'Drama' }) }),
    )
  })

  it('removes genre query param when All is selected', async () => {
    const mockFilterFn = vi.fn()
    mockRouteQueryValue = { genre: 'Drama' }
    useShowListMock.mockReturnValue(
      makeUseShowListReturn({
        showGenres: ref(['Drama', 'Comedy']),
        filterShowsByGenre: mockFilterFn,
      }),
    )
    const wrapper = mkWrapper()
    const filterWidget = wrapper.findComponent({ name: 'ShowFilterWidget' })
    await filterWidget.vm.$emit('filterApplied', 'All')
    expect(mockFilterFn).toHaveBeenCalledWith('All')
    expect(mockRouterReplace).toHaveBeenCalledWith(
      expect.objectContaining({ query: expect.not.objectContaining({ genre: expect.anything() }) }),
    )
  })
})
