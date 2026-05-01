import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import PaginationControls from '../PaginationWidget.vue'

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

  it('disables the next button when disableNext is true', () => {
    const wrapper = mount(PaginationControls, {
      props: { disableNext: true },
    })

    const button = wrapper.find('[aria-label="Next page"]').element as HTMLButtonElement

    expect(button.disabled).toBe(true)
  })
})
