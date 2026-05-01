import { test, expect } from '@playwright/test'
import { AxeBuilder } from '@axe-core/playwright'

test('visits the app root url', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('header a')).toContainText('Simple Telly')
})

test.describe('Shows Home View @showsHome', () => {
  test('search bar can be toggled', async ({ page }) => {
    await page.goto('/')

    await page.locator('button[aria-label="Toggle search"]').click()
    const searchInput = page.locator('input#show-search')
    await expect(searchInput).toBeVisible()
  })

  test('allows searching for shows', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('button[aria-label="Toggle search"]')).toBeVisible()
    await page.locator('button[aria-label="Toggle search"]').click()

    const searchInput = page.locator('input#show-search')
    await expect(searchInput).toBeVisible()

    await searchInput.fill('Breaking')
    await expect(page.locator('[aria-label="Search results for Breaking"]')).toBeVisible()
    await expect(
      page.locator('[aria-label="Search results for Breaking"] [role="listitem"]').first(),
    ).toBeVisible()
  })

  test('clears search input', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('button[aria-label="Toggle search"]')).toBeVisible()
    await page.locator('button[aria-label="Toggle search"]').click()

    const searchInput = page.locator('input#show-search')
    await expect(searchInput).toBeVisible()

    await searchInput.fill('Breaking')
    await expect(searchInput).toHaveValue('Breaking')

    const clearButton = page.locator('button[aria-label="Clear search"]')
    await expect(clearButton).toBeVisible()
    await clearButton.click()

    await expect(searchInput).toHaveValue('')
  })
})

test.describe('Show Details View @showDetails', () => {
  test('loads show details page', async ({ page }) => {
    await page.goto('/shows/491')
    await expect(page.locator('h1, [role="alert"]').first()).toBeVisible()
  })

  test('displays genres information', async ({ page }) => {
    await page.goto('/shows/491')
    await expect(page.locator('[aria-label="Genres"]')).toBeVisible()
  })

  test('has back button available', async ({ page }) => {
    await page.goto('/shows/491')

    const backButton = page
      .locator(
        'button[aria-label*="back" i], button[aria-label*="close" i], button[aria-label*="go back" i]',
      )
      .first()

    await expect(backButton).toBeVisible()
  })

  test('handles invalid show id gracefully', async ({ page }) => {
    await page.goto('/shows/999999999')
    await expect(page.locator('[role="alert"]')).toBeVisible()
  })
})

test.describe('Accessibility @a11y', () => {
  test('shows page has no a11y violations', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('header a')).toContainText('Simple Telly')

    const results = await new AxeBuilder({ page })
      .include('body')
      .exclude('.vue-devtools__anchor-btn')
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()

    expect(results.violations).toHaveLength(0)
  })

  test('show details page has no a11y violations', async ({ page }) => {
    await page.goto('/shows/491')
    await expect(page.locator('h1, [role="alert"]').first()).toBeVisible()

    const results = await new AxeBuilder({ page })
      .include('body')
      .exclude('.vue-devtools__anchor-btn') // Exclude Vue DevTools button
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()
    expect(results.violations).toHaveLength(0)
  })
})
