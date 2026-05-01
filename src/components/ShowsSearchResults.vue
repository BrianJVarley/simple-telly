<script setup lang="ts">
import { computed } from 'vue'
import type { SearchResult } from '@/types/tvShowModel'

const props = defineProps<{
  query: string
  results: SearchResult[]
  isLoading: boolean
  error: string | null
}>()

const emit = defineEmits<{ select: [showId: number] }>()

const announcement = computed(() => {
  if (!props.query.trim()) return ''
  if (props.isLoading) return `Searching for shows with name ${props.query}.`
  if (props.error) return `Search failed for show named ${props.query}. ${props.error}`
  if (!props.results.length) return `No results for show named ${props.query}.`
  const label = props.results.length === 1 ? 'show found' : 'shows found'
  return `${props.results.length} ${label} for search ${props.query}.`
})
</script>

<template>
  <p v-if="query" class="sr-only" role="status" aria-live="polite" aria-atomic="true">
    {{ announcement }}
  </p>
  <div
    v-if="query"
    class="flex-1 overflow-y-auto p-4"
    role="region"
    :aria-label="`Search results for ${query}`"
  >
    <div v-if="isLoading" class="text-gray-400 text-sm p-4" aria-busy="true">Searching...</div>
    <div v-else-if="error" class="text-red-400 text-sm p-4" role="alert">{{ error }}</div>
    <div v-else-if="!results.length" class="text-gray-500 text-sm p-4">
      No results for "{{ query }}"
    </div>
    <div
      v-else
      class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
      role="list"
    >
      <div
        v-for="{ show } in results"
        :key="show.id"
        :data-show-id="show.id"
        role="listitem"
        :aria-label="show.name"
        tabindex="0"
        @click="emit('select', show.id)"
        @keydown.enter.prevent="emit('select', show.id)"
        @keydown.space.prevent="emit('select', show.id)"
        class="rounded-lg overflow-hidden bg-gray-800 hover:scale-105 transition-transform cursor-pointer"
      >
        <img :src="show.image?.medium" :alt="show.name" class="w-full object-cover aspect-[2/3]" />
        <p class="p-2 text-sm font-medium truncate">{{ show.name }}</p>
      </div>
    </div>
  </div>
</template>
