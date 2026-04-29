import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Show } from '@/api/tvmaze-api'

export const useShowsStore = defineStore('shows', () => {
  const cache = ref<Map<number, Show>>(new Map())

  const all = computed(() => Array.from(cache.value.values()))

  function getById(id: number): Show | undefined {
    return cache.value.get(id)
  }

  function upsert(show: Show) {
    cache.value.set(show.id, show)
  }

  function upsertMany(shows: Show[]) {
    shows.forEach(upsert)
  }

  function clear() {
    cache.value.clear()
  }

  return { all, getById, upsert, upsertMany, clear }
})
