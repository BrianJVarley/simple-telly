import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, nextTick, ref } from 'vue'
import SearchBar from '../ShowsHome/SearchBar.vue'

vi.mock('@heroicons/vue/24/outline', () => ({
  MagnifyingGlassCircleIcon: { template: '<span class="icon-stub"></span>' },
}))

function mkWrapper() {
  return mount(
    defineComponent({
      components: { SearchBar },
      setup() {
        const query = ref('')
        const onClear = vi.fn()

        return { query, onClear }
      },
      template: '<SearchBar v-model:query="query" @clear="onClear" />',
    }),
    {
      attachTo: document.body,
      global: {
        directives: { tooltip: {} },
        stubs: { Transition: false },
      },
    },
  )
}

describe('SearchBar', () => {
  it('moves focus back to the search input after clear', async () => {
    const wrapper = mkWrapper()

    await wrapper.find('[aria-label="Toggle search"]').trigger('click')

    const input = wrapper.find('#show-search')
    await input.setValue('test')
    await wrapper.find('[aria-label="Clear search"]').trigger('click')
    await nextTick()

    expect(document.activeElement).toBe(input.element)

    wrapper.unmount()
  })
})
