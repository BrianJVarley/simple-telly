import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import TheWelcome from '../TheWelcome.vue'

describe('Home', () => {
  it('renders properly', () => {
    const wrapper = mount(TheWelcome, {
      global: {
        plugins: [createPinia()],
        stubs: {
          RecycleScroller: true,
        },
      },
    })
    expect(wrapper.getComponent(TheWelcome).isVisible()).toBe(true)
  })
})
