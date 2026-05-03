# Simple Telly

A Vue 3 app for browsing TV shows with a search feature and show details page. Uses the tvmaze api to provide tv shows data feed via REST API.

### Main User Flows

- Displays a banner show for top pick of the day
- Shows list view: `/` or `/shows?page=1`
- Show details view: `/shows/:id`
- Search and clear TV show queries
- Filter shows list by TV show genre ("Acrtion", "Comedy"..)
- Pagination and TV show browsing sorted genre & descending rating

## Quick Start

### 1. Requirements & Environment

- Node.js `^20.19.0` or `>=22.12.0`
- npm >= `10`

Create a `.env` file if you want to override app config defaults, for example:

```ts
VITE_TV_MAZE_API_BASE_URL=https://api.tvmaze.com
```

### 2. Install

```sh
npm install
```

### 3. Run locally

```sh
npm run dev
```

> Or run the production build preview, this is useful for running Lighthouse scans against production build.

```sh
npm run serve:production
```

Open the app URL output by CLI `http://localhost:5173/shows`

## Test Commands

### Unit tests (Vitest)

```sh
npm test
npm run test:libs
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

### CI Workflows

Pull requests trigger the [PR workflow](.github/workflows/pull-request-checks.yml). Which runs a number of sanity checks build, e2e, unit tests, linting.

## App Overview

## Project Structure

- Framework: Vue 3 + Vite + TypeScript
- apps/: Simple Telly Vue app in [apps/simple-telly](apps/simple-telly)
  - State Store: Pinia stores in [apps/simple-telly/src/stores](apps/simple-telly/src/stores)
  - Routing: [apps/simple-telly/src/router/index.ts](apps/simple-telly/src/router/index.ts)
  - Data access: API layer in [apps/simple-telly/src/api/tvmaze-api.ts](apps/simple-telly/src/api/tvmaze-api.ts)
  - Wrapper Views in [apps/simple-telly/src/views](apps/simple-telly/src/views)
  - Reusable components in [apps/simple-telly/src/components](apps/simple-telly/src/components)
- Libs: Packaged NPM library containing reuseable UI components. Imported into the app workspace as package import.
- Business logic & special behavior bundled into `composables` in [apps/simple-telly/src/composables](apps/simple-telly/src/composables)

### UX choices

- Responsive layout with desktop and mobile views using tailwind breakpoint classes
- Theme system with light/dark mode toggle and persisted user preference
- A basic error handling flow is added to go abck when shows page not found or try again for other error status.
- Semantic color tokens defined in [apps/simple-telly/src/assets/base.css](apps/simple-telly/src/assets/base.css)

### Design choices

- Navigation:
  - Pagination & genre filters are retained between navigation from shows to show details views. This is a common navigation pattern to retain selected view filters on back navigation.
  - Focused on readable contrast and accessible UI. By using correct keyboard navigation (Escape, Tab spacebar keys) order and focus order between navigations.
- Optimizations:
  - Image sources loaded using a mix of lazy loading and low vs eager fetch priority where needed. In addition computed was used to load some image sources. This improved First Contentful Paint metrics in Chrome Lighthouse performance scan (`0.4s`). See: [Lighthouse scan report](./performance-reports-chrome/simple-telly-v1-perf-report-1.html)
  - Search uses a debounce function to prevent spamming search requests.
  - Shows are loaded by page rather than one large block of data. This reduces load time and rendering effort of scrollers.
  - In mobile views, a tv shows are batched by page as user scrolls to the end of the list.
- A11Y:
  - Accessibility best practices adopted for voice over screen reader, using aria-\* attributed where needed.

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


## Trade-offs

> Some trade offs in the implementation I can think of:

- Libs contains subset of components, if developed further I would package all components, data-access and composeables into seperate libs. Then keep the app as a shell which imports the building blocks for the app & configuration option.
- Mobile views: I've opted to use vertical scroll to make the most of mobile screen real estate. It's also a more natural gesture for thumb scrolling.
- Pagination is enabled at page level rather than paging from each horizontal scroller. It's a technical trade off since the TVMaze API doesn't expose an API to search by TV show gerne & pagination.
- Filter & Search combination: I've gone with the simpler option of clearing search query when a genre filter is applied. But further work could be done to have a combined filter query.
- Show details is implemented as a seperate page to enable deep linking to specific shows by ID. Using a modal & deep linking would have required implementing custom routing code. It's straightforward to rely on browser history instead for navigation between shows.
- Refresh scenarios: On browser refresh variable values reset to initial values. Some refresh handling logic could be added to cache page, genre filters in browser session storage to solve this.
- TVMaze summary HTML is rendered directly with v-html because the content is trusted API content. But in a production application I would use a DOM sanitization package to sanitize v-html content.
- **Performance**: There are some metrics that can be improved on in last [Lighthouse scan report](performance-reports-chrome/simple-telly-v1-perf-report-1.html). Such as Largest Contentful Paint & Cumulative Layout Shift.

