import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { PaginationWidget as PaginationControls } from '@simple-telly/ui'

describe('PaginationControls', () => {
  it('renders the current page', () => {
    const wrapper = mount(PaginationControls, {
      props: { currentPage: 3 },
    })

    expect(wrapper.text()).toContain('Page 3')
  })

  it('emits previousPage when the previous button is clicked', async () => {
    const wrapper = mount(PaginationControls, {
      props: { currentPage: 2 },
    })

    await wrapper.find('[aria-label="Previous page"]').trigger('click')

    expect(wrapper.emitted('previousPage')).toHaveLength(1)
  })

  it('does not emit previousPage on the first page', async () => {
    const wrapper = mount(PaginationControls, {
      props: { currentPage: 1 },
    })

    await wrapper.find('[aria-label="Previous page"]').trigger('click')

    expect(wrapper.emitted('previousPage')).toBeUndefined()
  })

  it('emits nextPage when the next button is clicked', async () => {
    const wrapper = mount(PaginationControls, {
      props: { currentPage: 2 },
    })

    await wrapper.find('[aria-label="Next page"]').trigger('click')

    expect(wrapper.emitted('nextPage')).toHaveLength(1)
  })

  it('skips backward N pages when skip backward button is clicked', async () => {
    const wrapper = mount(PaginationControls, {
      props: { currentPage: 6, skipNavigationThreshold: 5 },
    })

    await wrapper.find('[data-testid="skip-backward-btn"]').trigger('click')

    expect(wrapper.emitted('skipBackward')).toHaveLength(1)
    expect(wrapper.emitted('skipBackward')?.[0]).toEqual([-5])
  })

  it('skips forward N pages when skip forward button is clicked', async () => {
    const wrapper = mount(PaginationControls, {
      props: { currentPage: 6, skipNavigationThreshold: 5 },
    })

    await wrapper.find('[data-testid="skip-forward-btn"]').trigger('click')

    expect(wrapper.emitted('skipForward')).toHaveLength(1)
    expect(wrapper.emitted('skipForward')?.[0]).toEqual([5])
  })

  it('disables the next button when disableNext is true', () => {
    const wrapper = mount(PaginationControls, {
      props: { disableNext: true },
    })

    const button = wrapper.find('[aria-label="Next page"]').element as HTMLButtonElement

    expect(button.disabled).toBe(true)
  })

  it('disables skip backward when the current page cannot move back by the threshold', () => {
    const wrapper = mount(PaginationControls, {
      props: { currentPage: 5, skipNavigationThreshold: 5 },
    })

    const button = wrapper.find('[data-testid="skip-backward-btn"]').element as HTMLButtonElement

    expect(button.disabled).toBe(true)
  })
})
