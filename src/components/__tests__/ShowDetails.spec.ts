import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { ref } from 'vue'
import ShowDetails from '../ShowDetails.vue'
import type { Show } from '@/types/tvShowModel'

// ── hoisted mock fns ────────────────────────────────────────────────────────
const mockRouterBack = vi.hoisted(() => vi.fn())
const useShowDetailMock = vi.hoisted(() => vi.fn())

vi.mock('vue-router', () => ({
  useRouter: () => ({ back: mockRouterBack }),
}))

vi.mock('@heroicons/vue/24/outline', () => ({
  ArrowLeftIcon: { template: '<button class="back-btn"></button>' },
}))

vi.mock('@/composables/useShowDetail', () => ({
  useShowDetail: useShowDetailMock,
}))

const mountedWrappers: { unmount: () => void }[] = []

// ── helpers ─────────────────────────────────────────────────────────────────
const makeShow = (overrides: Partial<Show> = {}): Show => ({
  id: 1,
  name: 'Breaking Bad',
  schedule: { time: '21:00', days: ['Sunday'] },
  type: 'Scripted',
  language: 'English',
  genres: ['Drama', 'Crime'],
  status: 'Ended',
  rating: { average: 9.5 },
  network: { id: 1, name: 'AMC' },
  summary: '<p>A chemistry teacher turns to crime.</p>',
  image: { medium: 'http://img.jpg', original: 'http://img.jpg' },
  premiered: '2008-01-20',
  officialSite: null,
  ...overrides,
})

const defaultDetailReturn = (overrides = {}) => ({
  show: ref<Show | null>(null),
  episodes: ref([]),
  episodesBySeason: () => new Map(),
  seasonCount: ref(0),
  isLoading: ref(false),
  error: ref<{ message: string; cause?: string } | null>(null),
  fetchShow: vi.fn(),
  ...overrides,
})

function mkWrapper(id = 1) {
  const w = mount(ShowDetails, {
    attachTo: document.body,
    props: { id },
    global: {
      plugins: [createPinia()],
      directives: { tooltip: {} },
      stubs: {
        ApiError: {
          template: '<div role="alert">{{ message }}</div>',
          props: ['message'],
        },
      },
    },
  })
  mountedWrappers.push(w)
  return w
}

// ── tests ────────────────────────────────────────────────────────────────────
describe('ShowDetails', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useShowDetailMock.mockReturnValue(defaultDetailReturn())
  })

  afterEach(() => {
    mountedWrappers.splice(0).forEach((w) => w.unmount())
  })

  it('shows loading state while fetching', () => {
    useShowDetailMock.mockReturnValue(defaultDetailReturn({ isLoading: ref(true) }))
    const wrapper = mkWrapper()
    expect(wrapper.text()).toContain('Loading...')
  })

  it('does not show show content while loading', () => {
    useShowDetailMock.mockReturnValue(defaultDetailReturn({ isLoading: ref(true) }))
    const wrapper = mkWrapper()
    expect(wrapper.find('[role="main"]').exists()).toBe(false)
  })

  it('shows error message when fetch fails', () => {
    useShowDetailMock.mockReturnValue(
      defaultDetailReturn({ error: ref({ message: 'Failed to load show' }) }),
    )
    const wrapper = mkWrapper()
    expect(wrapper.find('[role="alert"]').text()).toContain('Failed to load show')
  })

  it('renders nothing when show is null and not loading', () => {
    const wrapper = mkWrapper()
    expect(wrapper.find('[role="main"]').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('Loading...')
  })

  it('renders the show name', () => {
    useShowDetailMock.mockReturnValue(defaultDetailReturn({ show: ref(makeShow()) }))
    const wrapper = mkWrapper()
    expect(wrapper.find('h1').text()).toBe('Breaking Bad')
  })

  it('renders all genres as list items', () => {
    useShowDetailMock.mockReturnValue(defaultDetailReturn({ show: ref(makeShow()) }))
    const wrapper = mkWrapper()
    const items = wrapper.findAll('[role="listitem"]').map((el) => el.text())
    expect(items).toContain('Drama')
    expect(items).toContain('Crime')
  })

  it('renders show status and language', () => {
    useShowDetailMock.mockReturnValue(defaultDetailReturn({ show: ref(makeShow()) }))
    const wrapper = mkWrapper()
    expect(wrapper.text()).toContain('Ended')
    expect(wrapper.text()).toContain('English')
  })

  it('renders the rating when available', () => {
    useShowDetailMock.mockReturnValue(defaultDetailReturn({ show: ref(makeShow()) }))
    const wrapper = mkWrapper()
    expect(wrapper.text()).toContain('9.5')
  })

  it('does not render rating section when rating is null', () => {
    useShowDetailMock.mockReturnValue(
      defaultDetailReturn({ show: ref(makeShow({ rating: { average: null } })) }),
    )
    const wrapper = mkWrapper()
    // The ★ character only renders when average is truthy
    expect(wrapper.text()).not.toContain('\u2605')
  })

  it('renders network name when present', () => {
    useShowDetailMock.mockReturnValue(defaultDetailReturn({ show: ref(makeShow()) }))
    const wrapper = mkWrapper()
    expect(wrapper.text()).toContain('AMC')
  })

  it('does not render network section when network is null', () => {
    useShowDetailMock.mockReturnValue(
      defaultDetailReturn({ show: ref(makeShow({ network: null })) }),
    )
    const wrapper = mkWrapper()
    expect(wrapper.text()).not.toContain('AMC')
  })

  it('renders season count label with plural value', () => {
    useShowDetailMock.mockReturnValue(
      defaultDetailReturn({ show: ref(makeShow()), seasonCount: ref(5) }),
    )
    const wrapper = mkWrapper()
    expect(wrapper.text()).toContain('Seasons: 5')
  })

  it('renders season count label for exactly 1 season', () => {
    useShowDetailMock.mockReturnValue(
      defaultDetailReturn({ show: ref(makeShow()), seasonCount: ref(1) }),
    )
    const wrapper = mkWrapper()
    expect(wrapper.text()).toContain('Seasons: 1')
  })

  it('does not render season count section when seasonCount is 0', () => {
    useShowDetailMock.mockReturnValue(
      defaultDetailReturn({ show: ref(makeShow()), seasonCount: ref(0) }),
    )
    const wrapper = mkWrapper()
    expect(wrapper.text()).not.toContain('season')
  })

  it('renders show summary HTML', () => {
    useShowDetailMock.mockReturnValue(defaultDetailReturn({ show: ref(makeShow()) }))
    const wrapper = mkWrapper()
    expect(wrapper.html()).toContain('chemistry teacher')
  })

  it('does not render summary section when summary is null', () => {
    useShowDetailMock.mockReturnValue(
      defaultDetailReturn({ show: ref(makeShow({ summary: null })) }),
    )
    const wrapper = mkWrapper()
    expect(wrapper.text()).not.toContain('chemistry teacher')
  })

  it('renders show image', () => {
    useShowDetailMock.mockReturnValue(defaultDetailReturn({ show: ref(makeShow()) }))
    const wrapper = mkWrapper()
    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe('http://img.jpg')
    expect(img.attributes('alt')).toBe('Breaking Bad')
  })

  it('does not render image when show.image is null', () => {
    useShowDetailMock.mockReturnValue(defaultDetailReturn({ show: ref(makeShow({ image: null })) }))
    const wrapper = mkWrapper()
    expect(wrapper.find('img').exists()).toBe(false)
  })

  it('calls router.back() when back button is clicked', async () => {
    const wrapper = mkWrapper()
    await wrapper.find('.back-btn').trigger('click')
    expect(mockRouterBack).toHaveBeenCalled()
  })

  it('calls router.back() when Escape key is pressed', async () => {
    mkWrapper()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(mockRouterBack).toHaveBeenCalled()
  })

  it('removes the Escape listener when the component is unmounted', async () => {
    const wrapper = mkWrapper()
    wrapper.unmount()
    mockRouterBack.mockClear()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(mockRouterBack).not.toHaveBeenCalled()
  })

  it('passes the id prop to useShowDetail', () => {
    mkWrapper(42)
    expect(useShowDetailMock).toHaveBeenCalledWith(42)
  })
})
