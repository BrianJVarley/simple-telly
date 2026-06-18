# Vue 3 Refresh Plan — Simple Telly 

---

## Composables
**Goal:** Extract component logic into a reusable composable

- [ ] Pick a component in Simple Telly that mixes data fetching + local state (e.g. show detail)
- [ ] Create `composables/useShow.ts` — move fetch logic, loading, and error state into it
- [ ] Return reactive refs from the composable; consume in the component via `<script setup>`
- [ ] Confirm the component template is unchanged and still works
- [ ] **Stretch:** create a generic `useFetch<T>` composable and reuse it in two places

---

## Pinia at Scale
**Goal:** Typed stores, cross-store dependencies, `storeToRefs`

- [ ] Add a second store (e.g. `useWatchlistStore`) that reads from the existing shows store
- [ ] Use `storeToRefs` to destructure reactive state without losing reactivity
- [ ] Add a Pinia action that calls the TVMaze API and handles errors explicitly
- [ ] Type the store state and actions fully with TypeScript (no `any`)
- [ ] **Stretch:** use `$subscribe` to persist watchlist to `localStorage`

---

## Async Components & Lazy Routes
**Goal:** Code splitting with dynamic imports and `defineAsyncComponent`

- [ ] Convert one heavy/rarely-used component (e.g. a modal or detail panel) to `defineAsyncComponent`
- [ ] Add a new lazy-loaded route in Vue Router using `() => import(...)` syntax
- [ ] Add a `<Suspense>` wrapper with a loading fallback for the async component
- [ ] Verify the chunk appears separately in the Vite build output (`vite build`)
- [ ] **Stretch:** add an error boundary component for the `<Suspense>` error slot

---

## `provide` / `inject` with TypeScript
**Goal:** Pass context down a component tree without prop drilling

- [ ] Create an injection key using `InjectionKey<T>` from Vue
- [ ] Provide a simple context at app or layout level (e.g. current user preferences or a theme token)
- [ ] Inject and consume it in a deeply nested component
- [ ] Ensure the injected value is fully typed — no `unknown` leaking through
- [ ] **Stretch:** wrap provide/inject in a composable (`usePreferences()`) to hide the key

---

## Vitest Unit Tests
**Goal:** Test a composable and a Pinia store in isolation

- [ ] Install Vitest + `@vue/test-utils` if not already present (`npm i -D vitest @vue/test-utils`)
- [ ] Write tests for the `useShow.ts` composable from Day 1 — mock `fetch`, assert loading/error/data states
- [ ] Write tests for the Pinia store from Day 2 — use `setActivePinia(createPinia())` in `beforeEach`
- [ ] Assert store actions update state correctly
- [ ] Run `vitest --coverage` and check coverage report
- [ ] **Stretch:** add a component test using `mount()` that asserts rendered output based on store state

---

## Accessibility Pass
**Goal:** Apply WCAG patterns in Vue templates; differentiate yourself from day one

- [ ] Audit the show list and detail views with a screen reader (NVDA or macOS VoiceOver)
- [ ] Fix any missing `aria-label`, `role`, or heading hierarchy issues
- [ ] Add keyboard navigation to any interactive elements (cards, buttons, modals)
- [ ] Implement focus management on route change — restore or move focus appropriately
- [ ] Create a small `useFocusTrap` composable for any modal/dialog overlay
- [ ] **Stretch:** add an `aria-live` region for async loading state announcements

---


## Performance

**Goal** Identify, profile and improve performance low points in the production bundle
