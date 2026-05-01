# Simple Telly

A Vue 3 app for browsing TV shows, searching by title, and viewing show details.

## Quick Start (Reviewer)

### 1. Requirements

- Node.js `^20.19.0` or `>=22.12.0`
- npm

### 2. Install

```sh
npm install
```

### 3. Run locally

```sh
npm run dev
```

Open the URL printed by Vite (typically `http://localhost:5173`).

## What To Review In The App

### Main flows

- Shows list view: `/` or `/shows?page=1`
- Show details view: `/show/:id`
- Search and clear interactions in the header area
- Pagination and genre-row browsing

### UX / design choices

- Responsive layout with desktop and mobile show presentations
- Theme system with light/dark mode toggle and persisted user preference
- Semantic color tokens defined in [src/assets/base.css](src/assets/base.css)
- Focus on readable contrast and accessible text/background pairings

## Project Design (High Level)

- Framework: Vue 3 + Vite + TypeScript
- State: Pinia stores in [src/stores](src/stores)
- Routing: [src/router/index.ts](src/router/index.ts)
- Data access: API layer in [src/api/tvmaze-api.ts](src/api/tvmaze-api.ts)
- UI composition:
- Views in [src/views](src/views)
- Reusable components in [src/components](src/components)
- Behavior extracted into composables in [src/composables](src/composables)

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

Notes:

- Playwright runs Chromium and Firefox by default.
- WebKit is currently disabled in [playwright.config.ts](playwright.config.ts) because of Apple Silicon WebKit instability.

### Type check and build

```sh
npm run type-check
npm run build
```

### Lint

```sh
npm run lint
```

## Useful Files

- App shell and theme toggle: [src/App.vue](src/App.vue)
- Theme tokens: [src/assets/base.css](src/assets/base.css)
- E2E tests: [e2e/simple-telly.spec.ts](e2e/vue.spec.ts)
