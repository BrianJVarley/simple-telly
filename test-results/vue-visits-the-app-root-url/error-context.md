# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: vue.spec.ts >> visits the app root url
- Location: vue.spec.ts:5:1

# Error details

```
Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
Call log:
  - navigating to "/", waiting until "load"

```

# Test source

```ts
  1 | import { test, expect } from '@playwright/test'
  2 | 
  3 | // See here how to get started:
  4 | // https://playwright.dev/docs/intro
  5 | test('visits the app root url', async ({ page }) => {
> 6 |   await page.goto('/')
    |              ^ Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
  7 |   await expect(page.locator('h1')).toHaveText('Welcome to Simple Telly')
  8 | })
  9 | 
```