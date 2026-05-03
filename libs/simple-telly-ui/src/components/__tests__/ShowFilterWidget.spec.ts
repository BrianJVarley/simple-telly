import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ShowFilterWidget from '../ShowFilterWidget.vue'

vi.mock('@heroicons/vue/24/outline', () => ({
  FunnelIcon: { template: '<span class="funnel-icon-stub" />' },
}))

function mkWrapper(genres = ['Drama', 'Comedy']) {
  return mount(ShowFilterWidget, {
    props: { genres },
    global: { directives: { tooltip: {} } },
  })
}

describe('ShowFilterWidget', () => {
  it('renders the filter trigger button with Genre label', () => {
    const wrapper = mkWrapper()
    expect(wrapper.text()).toContain('Genre')
  })

  it('trigger button has correct aria attributes when closed', () => {
    const wrapper = mkWrapper()
    const btn = wrapper.find('button[aria-label="Filter shows by genre"]')
    expect(btn.exists()).toBe(true)
    expect(btn.attributes('aria-haspopup')).toBe('menu')
    expect(btn.attributes('aria-expanded')).toBe('false')
  })

  it('opens the dropdown with All plus passed genres when trigger is clicked', async () => {
    const wrapper = mkWrapper(['Drama', 'Comedy'])
    await wrapper.find('button[aria-label="Filter shows by genre"]').trigger('click')
    const items = wrapper.findAll('[role="menuitem"]')
    const labels = items.map((i) => i.text().trim())
    expect(labels).toContain('All')
    expect(labels).toContain('Drama')
    expect(labels).toContain('Comedy')
  })

  it('sets aria-expanded to true while dropdown is open', async () => {
    const wrapper = mkWrapper()
    const btn = wrapper.find('button[aria-label="Filter shows by genre"]')
    await btn.trigger('click')
    expect(btn.attributes('aria-expanded')).toBe('true')
  })

  it('emits filterApplied with the selected genre and closes menu on item click', async () => {
    const wrapper = mkWrapper(['Drama', 'Comedy'])
    await wrapper.find('button[aria-label="Filter shows by genre"]').trigger('click')
    const dramaBtn = wrapper.findAll('[role="menuitem"]').find((b) => b.text().trim() === 'Drama')!
    await dramaBtn.trigger('click')
    expect(wrapper.emitted('filterApplied')).toEqual([['Drama']])
    expect(wrapper.find('[role="menu"]').exists()).toBe(false)
  })

  it('closes the menu on Escape keydown', async () => {
    const wrapper = mkWrapper(['Drama'])
    await wrapper.find('button[aria-label="Filter shows by genre"]').trigger('click')
    expect(wrapper.find('[role="menu"]').exists()).toBe(true)
    await wrapper.find('[role="menu"]').trigger('keydown', { key: 'Escape' })
    expect(wrapper.find('[role="menu"]').exists()).toBe(false)
  })

  it('shows only All when genres prop is empty', async () => {
    const wrapper = mkWrapper([])
    await wrapper.find('button[aria-label="Filter shows by genre"]').trigger('click')
    const items = wrapper.findAll('[role="menuitem"]')
    expect(items).toHaveLength(1)
    expect(items[0]?.text().trim()).toBe('All')
  })

  it('deduplicates genres in the dropdown', async () => {
    const wrapper = mkWrapper(['Drama', 'Drama', 'Comedy'])
    await wrapper.find('button[aria-label="Filter shows by genre"]').trigger('click')
    const items = wrapper.findAll('[role="menuitem"]').map((i) => i.text().trim())
    expect(items.filter((g) => g === 'Drama')).toHaveLength(1)
  })
})
