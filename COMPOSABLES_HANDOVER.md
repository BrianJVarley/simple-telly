# Composables Handover

Date: 2026-06-18

## Scope

Reviewed composables in apps/simple-telly/src/composables for Vue Composition API pattern risks.

## 1) useShowDetail reactive input pattern

File: apps/simple-telly/src/composables/useShowDetail.ts

Issue:

- `useShowDetail` accepts a plain number (`showId: number`) and sets `watch(() => showId, ...)`.
- This only runs once for non-reactive input and will not update if the route prop changes while the component instance is reused.

Brief fix outline:

- Change signature to accept `MaybeRefOrGetter<number>`.
- Resolve the input with `toValue(showId)` in both `watch` and any direct calls.
- Replace watcher source with `watch(() => toValue(showId), fetchShow, { immediate: true })`.
- Keep API ergonomic by allowing either `props.id` or `() => props.id` from call sites.

## 2) useShowSearch stale response race

File: apps/simple-telly/src/composables/useShowSearch.ts

Status: Implemented (2026-06-18)

Issue:

- Debounced requests can resolve out of order.
- Older requests can overwrite newer results.

Brief fix outline:

- Use `AbortController` per active search request.
- Abort the previous in-flight request before starting a new one.
- Pass `signal` through the API layer to `fetch` and ignore aborted errors in the composable.

## 3) useShowSearch timer lifecycle cleanup

File: apps/simple-telly/src/composables/useShowSearch.ts

Issue:

- Debounce timeout is not cleared on unmount.
- A pending timer can fire after teardown and mutate state/store.

Brief fix outline:

- Add `onUnmounted(() => clearTimeout(debounceTimer))`.
- Initialize timer as `ReturnType<typeof setTimeout> | undefined` and guard clear with `if (debounceTimer)`.

## 4) useShowGenres derived-state watchEffect pattern

File: apps/simple-telly/src/composables/useShowGenres.ts

Issue:

- `genres` is derived from store data using mutable `watchEffect`.
- Early return when `showsStore.all.length === 0` leaves stale genre values.

Brief fix outline:

- Replace `ref + watchEffect` with a single `computed` genres list derived from `showsStore.all`.
- Build uniqueness with a `Set<string>` and return `Array.from(set)`.
- Keep `totalCount` as `computed(() => genres.value.length)`.

## 5) useShowNavigation module-scope shared state

File: apps/simple-telly/src/composables/useShowNavigation.ts

Issue:

- `lastVisitedShowId` and `savedScrollY` are module-scoped refs (singleton behavior).
- This is shared across all consumers and can be surprising if multiple instances exist.

Brief fix outline:

- If shared behavior is intentional: add a short comment/docstring stating singleton state is by design.
- If not intentional: move refs inside `useShowNavigation` so each consumer gets isolated state.
- If broader shared behavior is desired with visibility and testability: migrate this to a small Pinia store.

## Suggested order of implementation

1. Fix `useShowSearch` race and unmount cleanup first (user-facing correctness).
2. Fix `useShowDetail` reactive input contract.
3. Refactor `useShowGenres` to computed-only derived state.
4. Decide and document intent for `useShowNavigation` shared state.
