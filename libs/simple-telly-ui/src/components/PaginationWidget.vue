<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    currentPage?: number
    disableNext?: boolean
    skipNavigationThreshold?: number
  }>(),
  {
    currentPage: 1,
    disableNext: false,
    skipNavigationThreshold: 5,
  },
)

const emit = defineEmits<{
  previousPage: []
  nextPage: []
  skipBackward: [number]
  skipForward: [number]
}>()

function onPreviousPage() {
  if (props.currentPage <= 1) {
    return
  }

  emit('previousPage')
}

function onNextPage() {
  if (props.disableNext) {
    return
  }

  emit('nextPage')
}

function onSkipBackward() {
  if (props.currentPage <= props.skipNavigationThreshold) {
    return
  }

  emit('skipBackward', -props.skipNavigationThreshold)
}

function onSkipForward() {
  if (props.disableNext) {
    return
  }

  emit('skipForward', props.skipNavigationThreshold)
}
</script>

<template>
  <nav
    class="pagination-container flex items-center justify-center gap-3 rounded-lg bg-gray-900 px-4 py-3 text-sm text-white"
    aria-label="Pagination"
  >
    <button
      type="button"
      class="rounded-md border border-gray-700 px-3 py-2 transition-colors"
      :class="
        currentPage > 1
          ? 'hover:border-gray-500 hover:bg-gray-800'
          : 'cursor-not-allowed opacity-50'
      "
      :disabled="currentPage <= skipNavigationThreshold"
      data-testid="skip-backward-btn"
      :aria-label="`Go back ${skipNavigationThreshold} pages`"
      @click="onSkipBackward()"
      v-tooltip="{ text: `Go back ${skipNavigationThreshold} pages`, placement: 'left' }"
    >
      {{ '<<' }}
    </button>
    <button
      type="button"
      class="rounded-md border border-gray-700 px-3 py-2 transition-colors"
      :class="
        currentPage > 1
          ? 'hover:border-gray-500 hover:bg-gray-800'
          : 'cursor-not-allowed opacity-50'
      "
      :disabled="currentPage <= 1"
      aria-label="Previous page"
      @click="onPreviousPage"
    >
      {{ '<' }}
    </button>

    <p aria-live="polite" aria-atomic="true">Page {{ currentPage }}</p>

    <button
      type="button"
      class="rounded-md border border-gray-700 px-3 py-2 transition-colors"
      :class="
        !disableNext ? 'hover:border-gray-500 hover:bg-gray-800' : 'cursor-not-allowed opacity-50'
      "
      :disabled="disableNext"
      aria-label="Next page"
      @click="onNextPage"
    >
      {{ '>' }}
    </button>
    <button
      type="button"
      class="rounded-md border border-gray-700 px-3 py-2 transition-colors"
      :class="
        !disableNext ? 'hover:border-gray-500 hover:bg-gray-800' : 'cursor-not-allowed opacity-50'
      "
      :disabled="disableNext"
      data-testid="skip-forward-btn"
      :aria-label="`Go forward ${skipNavigationThreshold} pages`"
      @click="onSkipForward()"
      v-tooltip="{ text: `Go forward ${skipNavigationThreshold} pages`, placement: 'right' }"
    >
      {{ '>>' }}
    </button>
  </nav>
</template>
<style>
.pagination-container {
  background-color: var(--color-background-soft);
}
</style>
