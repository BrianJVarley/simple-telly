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
    class="pagination-shell flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm"
    aria-label="Pagination"
  >
    <button
      type="button"
      class="pagination-btn rounded-md border px-3 py-2 transition-colors"
      :class="currentPage > 1 ? 'pagination-btn-enabled' : 'cursor-not-allowed opacity-50'"
      :disabled="currentPage <= 1"
      aria-label="Previous page"
      @click="onPreviousPage"
    >
      Previous
    </button>

    <p aria-live="polite" aria-atomic="true">Page {{ currentPage }}</p>

    <button
      type="button"
      class="pagination-btn rounded-md border px-3 py-2 transition-colors"
      :class="!disableNext ? 'pagination-btn-enabled' : 'cursor-not-allowed opacity-50'"
      :disabled="disableNext"
      aria-label="Next page"
      @click="onNextPage"
    >
      Next
    </button>
  </nav>
</template>

<style scoped>
.pagination-shell {
  background-color: var(--color-background-soft);
  border-color: var(--color-border);
  color: var(--color-text);
}

.pagination-btn {
  border-color: var(--color-border);
  color: var(--color-text);
}

.pagination-btn-enabled:hover {
  border-color: var(--color-border-hover);
  background-color: var(--color-background-mute);
}
</style>
