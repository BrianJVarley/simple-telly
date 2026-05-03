import { test, expect } from '@playwright/test'
import { AxeBuilder } from '@axe-core/playwright'

test('visits the app root url', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('header a')).toContainText('Simple Telly')
})

test.describe('Shows Home View @showsHome', () => {
  test('shows the top-pick banner on desktop and navigates to show details when clicked @topPicksBanner', async ({
    page,
  }) => {
    await page.goto('/')

    const topPickBanner = page.locator('[data-testid="top-picks-banner"]').first()
    await expect(topPickBanner).toBeVisible()

    await topPickBanner.locator('img').click()

    await expect(page).toHaveURL(/\/shows\/\d+/)
    await expect(page.locator('h1, [role="alert"]').first()).toBeVisible()
  })

  test('hides the top-pick banner while search is active @topPicksBanner', async ({ page }) => {
    await page.goto('/')

    const topPickBanner = page.locator('[data-testid="top-picks-banner"]').first()
    await expect(topPickBanner).toBeVisible()

    await page.locator('button[aria-label="Toggle search"]').click()
    await page.locator('input#show-search').fill('Breaking')

    await expect(topPickBanner).toBeHidden()
  })

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

  test('allows filtering shows by genre', async ({ page }) => {
    await page.goto('/')

    const genreFilterButton = page.locator('button[aria-label="Filter shows by genre"]')
    await expect(genreFilterButton).toBeVisible()
    await genreFilterButton.click()

    const genreOption = page.locator('button[role="menuitem"]').nth(2) // Select the 3rd genre option for testing
    await expect(genreOption).toBeVisible()
    const genreName = await genreOption.textContent()
    await genreOption.click()

    // expect shows genre contains rows with genre label - genreName
    const showCards = page.locator('[data-testid="show-card"]')
    await expect(showCards.first()).toBeVisible()
    await expect(showCards.first().locator(`[aria-label="Genres: ${genreName}"]`)).toBeVisible()
  })



  test('selecting a genre sets ?genre= in the URL and shows only that genre @genreFilter', async ({
    page,
  }) => {
    await page.goto('/')

    const filterBtn = page.locator('button[aria-label="Filter shows by genre"]')
    await filterBtn.click()

    // pick the second option (index 1 = first real genre after "All")
    const firstGenreOption = page.locator('button[role="menuitem"]').nth(1)
    const genreName = (await firstGenreOption.textContent())!.trim()
    await firstGenreOption.click()

    await expect(page).toHaveURL(new RegExp(`[?&]genre=${encodeURIComponent(genreName)}`))

    // All visible genre row headings should match the selected genre
    const genreHeadings = page.locator('[data-testid="genre-heading"]')
    const count = await genreHeadings.count()
    for (let i = 0; i < count; i++) {
      await expect(genreHeadings.nth(i)).toContainText(genreName)
    }
  })

  test('selecting All removes ?genre= from the URL @genreFilter', async ({ page }) => {
    await page.goto('/')

    const filterBtn = page.locator('button[aria-label="Filter shows by genre"]')
    await filterBtn.click()
    const firstGenreOption = page.locator('button[role="menuitem"]').nth(1)
    await firstGenreOption.click()

    // now select All
    await filterBtn.click()
    const allOption = page.locator('button[role="menuitem"]', { hasText: 'All' })
    await allOption.click()

    await expect(page).not.toHaveURL(/[?&]genre=/)
  })

  test('back navigation restores genre filter from URL @genreFilter', async ({ page }) => {
    await page.goto('/')

    const filterBtn = page.locator('button[aria-label="Filter shows by genre"]')
    await filterBtn.click()
    const firstGenreOption = page.locator('button[role="menuitem"]').nth(1)
    const genreName = (await firstGenreOption.textContent())!.trim()
    await firstGenreOption.click()

    // navigate to a show details page
    const showCard = page.locator('[data-testid="show-card"]').first()
    await expect(showCard).toBeVisible()
    await showCard.click()
    await expect(page).toHaveURL(/\/shows\/\d+/)

    // go back
    await page.goBack()
    await expect(page).toHaveURL(new RegExp(`[?&]genre=${encodeURIComponent(genreName)}`))
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
