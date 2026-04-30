import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { ref, computed } from 'vue'
import ShowsHome from '../ShowsHome.vue'
import type { Show, SearchResult } from '@/types/tvShowModel'

// ── hoisted mock fns ──────────────────────────────────────────────────────────
const mockSearch = vi.hoisted(() => vi.fn())
const mockClear = vi.hoisted(() => vi.fn())
const mockRouterPush = vi.hoisted(() => vi.fn())
const useShowSearchMock = vi.hoisted(() => vi.fn())
const useShowListMock = vi.hoisted(() => vi.fn())

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockRouterPush }),
}))

vi.mock('@/composables/useShowSearch', () => ({
  useShowSearch: useShowSearchMock,
}))

vi.mock('@/composables/useShowList', () => ({
  useShowList: useShowListMock,
}))

vi.mock('@heroicons/vue/24/outline', () => ({
  MagnifyingGlassCircleIcon: { template: '<span class="icon-stub"></span>' },
}))

vi.mock('@vueuse/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@vueuse/core')>()
  const { ref } = await import('vue')
  return {
    ...actual,
    useBreakpoints: vi.fn(() => ({
      smaller: vi.fn(() => ref(false)), // desktop by default
    })),
    useVirtualList: vi.fn(() => ({
      list: ref([]),
      containerProps: { onScroll: vi.fn() },
      wrapperProps: { style: {} },
    })),
  }
})

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

// ── tests ─────────────────────────────────────────────────────────────────────
describe('ShowsHome', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useShowSearchMock.mockReturnValue({
      results: ref([]),
      isLoading: ref(false),
      error: ref(null),
      search: mockSearch,
      clear: mockClear,
    })
    useShowListMock.mockReturnValue({
      shows: computed(() => []),
      showsSortedByGenre: ref(new Map()),
      isLoading: ref(false),
      error: ref(null),
      refresh: vi.fn(),
    })
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
    useShowListMock.mockReturnValue({
      shows: computed(() => [show]),
      showsSortedByGenre: ref(
        new Map([
          ['Drama', [show]],
          ['Action', [show]],
        ]),
      ),
      isLoading: ref(false),
      error: ref(null),
      refresh: vi.fn(),
    })
    const wrapper = mkWrapper()
    expect(wrapper.findAll('.genre-row-stub').length).toBe(2)
  })

  it('shows loading state for show list', () => {
    useShowListMock.mockReturnValue({
      shows: computed(() => []),
      showsSortedByGenre: ref(new Map()),
      isLoading: ref(true),
      error: ref(null),
      refresh: vi.fn(),
    })
    const wrapper = mkWrapper()
    expect(wrapper.text()).toContain('Loading shows...')
  })

  it('shows error state for show list', () => {
    useShowListMock.mockReturnValue({
      shows: computed(() => []),
      showsSortedByGenre: ref(new Map()),
      isLoading: ref(false),
      error: ref('Network error'),
      refresh: vi.fn(),
    })
    const wrapper = mkWrapper()
    expect(wrapper.text()).toContain('Network error')
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
    expect(mockRouterPush).toHaveBeenCalledWith({ name: 'show-details', params: { id: 42 } })
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
    expect(mockRouterPush).toHaveBeenCalledWith({ name: 'show-details', params: { id: 7 } })
  })
})
