<script setup lang="ts">
import { ApiErrorTypes } from '@/types/apiErrorModel'
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/vue/24/outline'

defineProps<{ message?: string; cause: keyof typeof ApiErrorTypes | undefined }>()
const emit = defineEmits<{ retry: []; backToHome: [] }>()
</script>

<template>
  <div
    class="api-error-shell flex flex-col items-center justify-center flex-1 gap-4 p-8 text-center"
    role="alert"
    aria-live="assertive"
  >
    <ExclamationTriangleIcon class="w-12 h-12 text-red-400" aria-hidden="true" />
    <p class="api-error-message text-sm max-w-sm">{{ message ?? 'Something went wrong.' }}</p>
    <button
      @click="cause === ApiErrorTypes['Not Found'] ? emit('backToHome') : emit('retry')"
      class="api-error-btn flex items-center gap-2 text-sm px-4 py-2 rounded-lg transition-colors cursor-pointer"
    >
      <ArrowPathIcon class="w-4 h-4" aria-hidden="true" />
      {{ cause === ApiErrorTypes['Not Found'] ? 'Back to Home' : 'Try again' }}
    </button>
  </div>
</template>

<style scoped>
.api-error-shell {
  background-color: var(--color-background);
  color: var(--color-text);
}

.api-error-message {
  color: var(--color-warning);
}

.api-error-btn {
  background-color: var(--color-background-mute);
  border: 1px solid var(--color-border);
  color: var(--color-text);
}

.api-error-btn:hover {
  background-color: var(--color-background-soft);
  border-color: var(--color-border-hover);
}
</style>
