<script setup lang="ts">
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/vue/24/outline'

defineProps<{ message?: string }>()
const emit = defineEmits<{ retry: [] }>()
</script>

<template>
  <div
    class="flex flex-col items-center justify-center flex-1 gap-4 p-8 text-center bg-gray-950 text-white"
    role="alert"
    aria-live="assertive"
  >
    <ExclamationTriangleIcon class="w-12 h-12 text-red-400" aria-hidden="true" />
    <p class="text-red-300 text-sm max-w-sm">{{ message ?? 'Something went wrong.' }}</p>
    <button
      @click="emit('retry')"
      class="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white text-sm px-4 py-2 rounded-lg transition-colors cursor-pointer"
    >
      <ArrowPathIcon class="w-4 h-4" aria-hidden="true" />
      Try again
    </button>
  </div>
</template>
