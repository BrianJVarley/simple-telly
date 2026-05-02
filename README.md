# Simple Telly

A Vue 3 app for browsing TV shows with a search feature and show details page. Uses the tvmaze api to provide tv shows data feed via REST API.

### Main User Flows

- Displays a banner show for top pick of the day
- Shows list view: `/` or `/shows?page=1`
- Show details view: `/shows/:id`
- Search and clear TV show queries
- Pagination and TV show browsing sorted genre & descending rating

## Quick Start

### 1. Requirements

- Node.js `^20.19.0` or `>=22.12.0`
- npm >= `10`

### 2. Install

```sh
npm install
```

### 3. Run locally

```sh
npm run dev
```

Open the app URL output by CLI `http://localhost:5173/shows`

## Test Commands

### Unit tests (Vitest)

```sh
npm test
```

### End-to-end tests (Playwright)

```sh
# first time only
npx playwright install

# full e2e suite
npm run test:e2e
```

### Types check & build

```sh
npm run type-check
npm run build
```

### Lint

```sh
npm run lint
```

## App Overview

## Project Structure

- Framework: Vue 3 + Vite + TypeScript
- State Store: Pinia stores in [src/stores](src/stores)
- Routing: [src/router/index.ts](src/router/index.ts)
- Data access: API layer in [src/api/tvmaze-api.ts](src/api/tvmaze-api.ts)
- Wrapper Views in [src/views](src/views)
  - Reusable components in [src/components](src/components)
- Business logic & special behavior bundled into `composables` in [src/composables](src/composables)

### UX / design choices

- Responsive layout with desktop and mobile views using tailwind breakpoint classes
- Focus on readable contrast and accessible UI. By using correct keyboard navigation (Escape, Tab spacebar keys) order and focus between navigations
- Pagination retained between navigation from shows to show details views
- Accessibility best practices adopted for voice over screen reader, using aria-* attributed where needed.
- Theme system with light/dark mode toggle and persisted user preference
- A basic error handling flow is added to go abck when shows page not found or try again for other error status.
- Semantic color tokens defined in [src/assets/base.css](src/assets/base.css)
- `WCAG 2AA` targeted in E2E tests to ensure application is compliant.

## Architecture Decisions

### Why Vue 3

Vue 3 was chosen as its easy to compose views with the component model and provides reactivity helpers for view updates. It's also the main framework used within the Core Transaction Team.

### Why Pinia

Pinia is used for shared state, mainly caching show data between list and detail views. It keeps global state minimal & avoids "prop drilling". In general the store pattern is a common one for state management in enterprise applications.

### Why composables

The business logic is encapsulated into Vue composables to keep the components presentational.

- show list fetching and grouping
- search behavior and debouncing
- show detail fetching
- horizontal scroll behavior
- navigation focus logic
- document title updates

### State approach

The app uses local component state for view-specific concerns (`ref`) and shared composables & Pinia only where state must survive between navigation events. For example page number is retained when exiting the show details view.

## Trade-offs

> Some trade offs in the implementation I can think of:

- Scroll position & focus is implemented for desktop back-navigation, but for mobile scroll it was intentionally skipped to reduce complexity.
- Mobile views: I've opted to use vertical scroll to make the most of mobile screen real estate. It's also a more natural gesture for thumb scrolling.
- Pagination is enabled at page level rather than paging from eachhorizontal scroller. It's a technical trade off since the TVMaze API doesn't expose an API to search by TV show gerne & pagination.
- Show details is implemented as a seperate page to enable deep linking to specific shows by ID. Using a modal & deep linking would have required implementing custom routing code. It's straightforward to rely on browser history instead for navigation between shows.
- TVMaze summary HTML is rendered directly with v-html because the content is trusted API content. But in a production application I would use a DOM sanitization package to sanitize v-html content.
- Filters: If implemented further I could have added a filters toolbar. This filter would refine list based on a selected genre. Which would reduce needing to scroll down to a specific genre in page.
- E2E coverage is focused on the core user flows rather than using visual regression tests or mutation tests.
