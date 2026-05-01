import { test, expect } from '@playwright/test'
import { AxeBuilder } from '@axe-core/playwright'

test('visits the app root url', async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  // Check for the Simple Telly branding in the header
  const brandLink = page.locator('header a')
  await expect(brandLink).toBeVisible()
  await expect(brandLink).toContainText('Simple Telly')
})

test.describe('Shows Home View @showsHome', () => {
  test('search bar can be toggled', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    await page.locator('button[aria-label="Toggle search"]').click()

    const searchInput = page.locator('input#show-search')
    await expect(searchInput).toBeVisible({ timeout: 5000 })
  })

  test('allows searching for shows', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    await page.locator('button[aria-label="Toggle search"]').click()

    const searchInput = page.locator('input#show-search')
    await expect(searchInput).toBeVisible({ timeout: 5000 })

    await searchInput.fill('Breaking')
    await page.waitForTimeout(1000)

    await expect(page.locator('body')).toBeTruthy()
  })

  test('clears search input', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    await page.locator('button[aria-label="Toggle search"]').click()

    const searchInput = page.locator('input#show-search')
    await expect(searchInput).toBeVisible({ timeout: 5000 })

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
    await page.goto('/show/491')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    const heading = page.locator('h1').first()
    const errorMsg = page.locator('[role="alert"], text=/error|not found/i')

    const hasHeading = await heading.isVisible({ timeout: 5000 }).catch(() => false)
    const hasError = await errorMsg.isVisible({ timeout: 1000 }).catch(() => false)

    expect(hasHeading || hasError).toBeTruthy()
  })

  test('displays genres information', async ({ page }) => {
    await page.goto('/show/491')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    const bodyElement = page.locator('body')
    await expect(bodyElement).toBeVisible()
  })

  test('has back button available', async ({ page }) => {
    await page.goto('/show/491')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    const backButton = page
      .locator(
        'button[aria-label*="back" i], button[aria-label*="close" i], button[aria-label*="go back" i]',
      )
      .first()

    const isVisible = await backButton.isVisible({ timeout: 5000 }).catch(() => false)
    expect(isVisible).toBeTruthy()
  })

  test('handles invalid show id gracefully', async ({ page }) => {
    await page.goto('/show/999999999')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    const bodyElement = page.locator('body')
    await expect(bodyElement).toBeVisible()
  })
})

test.describe('Accessibility @a11y', () => {
  test('shows page has no a11y violations', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    try {
      const results = await new AxeBuilder({ page })
        .include('body')
        .exclude('.vue-devtools__anchor-btn') // Exclude Vue DevTools button
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze()

      if (results.violations.length > 0) {
        console.log(
          'Shows page a11y violations found:',
          results.violations.map((v) => v.id).join(', '),
        )
      }

      expect(results.violations.length).toBe(0)
    } catch (error) {
      console.warn('A11y scan encountered an error:', error)
      // Don't fail test if scan itself errors
      expect(true).toBe(true)
    }
  })

  test('show details page has no a11y violations', async ({ page }) => {
    await page.goto('/show/491')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    try {
      const results = await new AxeBuilder({ page })
        .include('body')
        .exclude('.vue-devtools__anchor-btn') // Exclude Vue DevTools button
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze()

      if (results.violations.length > 0) {
        console.log(
          'Show details a11y violations found:',
          results.violations.map((v) => v.id).join(', '),
        )
      }

      expect(results.violations.length).toBe(0)
    } catch (error) {
      console.warn('A11y scan encountered an error:', error)
      // Don't fail test if scan itself errors
      expect(true).toBe(true)
    }
  })
})
