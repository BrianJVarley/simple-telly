# Simple Telly

A Vue 3 app for browsing TV shows with search feature and show details page. Uses the tvmaze api to provide tv shows data 

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

Open the app URL output by CLI `http://localhost:5173`

## Overview

### Main flows

- Shows list view: `/` or `/shows?page=1`
- Show details view: `/shows/:id`
- Search and clear TV show queries 
- Pagination and TV show genre browsing

## Project Design (High Level)

- Framework: Vue 3 + Vite + TypeScript
- State: Pinia stores in [src/stores](src/stores)
- Routing: [src/router/index.ts](src/router/index.ts)
- Data access: API layer in [src/api/tvmaze-api.ts](src/api/tvmaze-api.ts)
- UI composition:
- Views in [src/views](src/views)
- Reusable components in [src/components](src/components)
- Business Logic & Behavior refactored into composables in [src/composables](src/composables)

### UX / design choices

- Responsive layout with desktop and mobile views
- Theme system with light/dark mode toggle and persisted user preference
- Semantic color tokens defined in [src/assets/base.css](src/assets/base.css)
- Focus on readable contrast and accessible UI with correct keyboard navigation and focus order



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

## Architecture Decisions

### Why Vue 3
Vue 3 was chosen for its strong single-file component model, straightforward reactivity system, and low setup overhead for a focused frontend assessment.

### Why Pinia
Pinia is used for lightweight shared state, mainly caching show data between list and detail views. It keeps global state minimal while avoiding prop drilling.

### Why composables
Business logic is kept in composables to keep components presentation-focused. This includes:
- show list fetching and grouping
- search behavior and debouncing
- show detail fetching
- horizontal scroll behavior
- navigation restoration
- document title updates

### State approach
The app uses local component state for view-specific concerns and shared composables or Pinia only where state must survive between components or routes.

## Trade-offs

- The app favors simple route-driven flows over a more abstract state machine.
- Scroll restoration is implemented for desktop/back-navigation focus restoration, while mobile scroll restoration was intentionally skipped to reduce complexity.
- TVMaze summary HTML is rendered directly with v-html because the content is trusted API content for this assessment.
- E2E coverage is focused on core user journeys rather than exhaustive visual regression.


