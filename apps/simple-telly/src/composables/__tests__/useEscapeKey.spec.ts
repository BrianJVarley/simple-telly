import { describe, it, expect, vi, beforeEach } from 'vitest'
import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { useEscapeKey } from '../useKeyboardNavHelpers'

function mkWrapper(handler: () => void) {
  return mount(
    defineComponent({
      setup() {
        useEscapeKey(handler)
      },
      template: '<div />',
    }),
  )
}

describe('useEscapeKey', () => {
  let handler: () => void

  beforeEach(() => {
    handler = vi.fn()
  })

  it('calls the handler when Escape is pressed', () => {
    mkWrapper(handler)
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(handler).toHaveBeenCalledOnce()
  })

  it('does not call the handler for other keys', () => {
    mkWrapper(handler)
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }))
    expect(handler).not.toHaveBeenCalled()
  })

  it('removes the listener when the component is unmounted', () => {
    const wrapper = mkWrapper(handler)
    wrapper.unmount()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(handler).not.toHaveBeenCalled()
  })
})
