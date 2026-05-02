<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    currentPage?: number
    disableNext?: boolean
  }>(),
  {
    currentPage: 1,
    disableNext: false,
  },
)

const emit = defineEmits<{
  previousPage: []
  nextPage: []
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
</script>

<template>
  <nav
    class="flex items-center justify-center-safe gap-3 rounded-lg bg-gray-900 px-4 py-3 text-sm text-white"
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
  </nav>
</template>
