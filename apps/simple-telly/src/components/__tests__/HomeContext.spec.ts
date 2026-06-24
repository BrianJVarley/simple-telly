import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { computed, defineComponent, h, nextTick, ref } from 'vue'
import {
  asReadonlyState,
  provideHomeState,
  useHomeState,
  type HomeStateContext,
} from '../ShowsHome/HomeContext'

function makeHomeState(overrides: Partial<HomeStateContext> = {}): HomeStateContext {
  return {
    query: '',
    hasActiveQuery: false,
    results: [],
    searchLoading: false,
    searchError: null,
    showsByGenre: new Map(),
    showsTopPick: null,
    currentPage: 0,
    totalShows: 0,
    listLoading: false,
    listError: null,
    isMobile: false,
    ...overrides,
  }
}

function toProviderInput(state: HomeStateContext): Parameters<typeof provideHomeState>[0] {
  return Object.fromEntries(
    Object.entries(state).map(([key, value]) => [key, ref(value)]),
  ) as unknown as Parameters<typeof provideHomeState>[0]
}

const ConsumerHarness = defineComponent({
  name: 'ConsumerHarness',
  setup() {
    const state = useHomeState()
    return { state }
  },
  render() {
    return h('div', { 'data-testid': 'consumer' }, [
      h('span', { 'data-testid': 'query' }, this.state.query),
      h('span', { 'data-testid': 'page' }, String(this.state.currentPage)),
      h('span', { 'data-testid': 'is-mobile' }, String(this.state.isMobile)),
      h('span', { 'data-testid': 'has-active-query' }, String(this.state.hasActiveQuery)),
    ])
  },
})

const ProviderHarness = defineComponent({
  name: 'ProviderHarness',
  props: {
    state: {
      type: Object as () => HomeStateContext,
      required: true,
    },
  },
  setup(props) {
    provideHomeState(toProviderInput(props.state))
    return {}
  },
  render() {
    return h(ConsumerHarness)
  },
})

describe('HomeContext', () => {
  describe('useHomeState', () => {
    it('throws a descriptive error when context is missing', () => {
      expect(() => mount(ConsumerHarness)).toThrow(
        'HomeStateContext not provided. Wrap component in provideHomeState provider.',
      )
    })
    it('returns provided state to descendants', () => {
      const state = makeHomeState({
        query: 'initial',
        currentPage: 1,
        isMobile: true,
        hasActiveQuery: true,
      })
      const wrapper = mount(ProviderHarness, {
        props: { state },
      })

      expect(wrapper.get('[data-testid="query"]').text()).toBe('initial')
      expect(wrapper.get('[data-testid="page"]').text()).toBe('1')
      expect(wrapper.get('[data-testid="is-mobile"]').text()).toBe('true')
    })
  })

  describe('provideHomeState', async () => {
    it('supports computed values in provider input and keeps them reactive', async () => {
      const query = ref('initial')
      const currentPage = ref(0)
      const isMobile = computed(() => false)

      const stateInput = {
        query,
        currentPage,
        isMobile,
        hasActiveQuery: computed(() => !!query.value),
        results: ref([]),
        searchLoading: ref(false),
        searchError: ref(null),
        showsByGenre: ref(new Map()),
        showsTopPick: ref(null),
        totalShows: ref(0),
        listLoading: ref(false),
        listError: ref(null),
      }

      const wrapper = mount(ProviderHarness, {
        props: { state: stateInput as unknown as HomeStateContext },
      })

      expect(wrapper.get('[data-testid="query"]').text()).toBe('initial')
      expect(wrapper.get('[data-testid="page"]').text()).toBe('0')
      expect(wrapper.get('[data-testid="is-mobile"]').text()).toBe('false')

      query.value = 'updated'
      currentPage.value = 5

      await nextTick()

      expect(wrapper.get('[data-testid="query"]').text()).toBe('updated')
      expect(wrapper.get('[data-testid="page"]').text()).toBe('5')
      expect(wrapper.get('[data-testid="has-active-query"]').text()).toBe('true')
    })
  })

  describe('asReadonlyState', () => {
    it('returns a readonly object proxy', () => {
      const state = { query: ref('test') }
      const readonlyState = asReadonlyState(state)
      expect(readonlyState.query).toBe('test')
    })
    it('keeps source ref updates observable in consumers', () => {
      const query = ref('initial')
      const readonlyState = asReadonlyState({ query })
      expect(readonlyState.query).toBe('initial')
      query.value = 'updated'
      expect(readonlyState.query).toBe('updated')
    })
  })
})

describe('sanity checks', () => {
  it('mounts provider and consumer harness', () => {
    const wrapper = mount(ProviderHarness, {
      props: {
        state: makeHomeState({ query: 'demo', currentPage: 2, isMobile: true }),
      },
    })

    expect(wrapper.get('[data-testid="query"]').text()).toBe('demo')
    expect(wrapper.get('[data-testid="page"]').text()).toBe('2')
    expect(wrapper.get('[data-testid="is-mobile"]').text()).toBe('true')
  })

  it('returns a readonly unwrapped state object from refs and computed values', () => {
    const query = ref('initial')
    const currentPage = ref(0)
    const isMobile = computed(() => false)

    const readonlyState = asReadonlyState({ query, currentPage, isMobile })

    expect(readonlyState.query).toBe('initial')
    expect(readonlyState.currentPage).toBe(0)
    expect(readonlyState.isMobile).toBe(false)
    expect(readonlyState.isMobile.hasOwnProperty('value')).toBe(false)
  })
})
