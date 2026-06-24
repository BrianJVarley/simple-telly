import { inject, provide, proxyRefs, readonly, type ComputedRef, type InjectionKey, type Ref } from 'vue'
import type { Show, SearchResult, ShowsByGenre } from '@/types/tvShowModel'
import type { ApiErrorTypes } from '@/types/apiErrorModel'

type HomeStateRefs = {
  [K in keyof HomeStateContext]: MaybeRef<HomeStateContext[K]>
}

export interface HomeStateContext {
  query: string
  hasActiveQuery: boolean
  results: SearchResult[]
  searchLoading: boolean
  searchError: string | null
  showsByGenre: ShowsByGenre
  showsTopPick: Show | null
  currentPage: number
  totalShows: number
  listLoading: boolean
  listError: { message: string; cause?: keyof typeof ApiErrorTypes | undefined } | null
  isMobile: boolean
}

export const HomeStateKey: InjectionKey<Readonly<HomeStateContext>> = Symbol('HomeStateContext')

export function provideHomeState(state: HomeStateRefs) {
  provide(HomeStateKey, asReadonlyState(state))
}

export function useHomeState(): HomeStateContext {
  const ctx = inject(HomeStateKey)
  if (!ctx) {
    throw new Error('HomeStateContext not provided. Wrap component in provideHomeState provider.')
  }
  return ctx
}

type MaybeRef<T> = Ref<T> | ComputedRef<T>
type UnwrapMaybeRef<T> = T extends Ref<infer V> ? V : T extends ComputedRef<infer V> ? V : T

export function asReadonlyState<T extends Record<string, MaybeRef<unknown>>>(state: T) {
  return readonly(proxyRefs(state)) as Readonly<{
    [K in keyof T]: UnwrapMaybeRef<T[K]>
  }>
}

export function asReadonlyRef<T>(value: Ref<T>): Readonly<Ref<T>> {
  return readonly(value) as Readonly<Ref<T>>
}
