import { ref, computed, watchEffect } from 'vue'
import type { Show } from '@/types/tvShowModel'
import { useShowsStore } from '@/stores/shows'


/**
 * Composable to reuse logic for fetching and managing TV show genres
 * @param options
 * @returns
 */
export function useShowGenres() {
  const showsStore = useShowsStore()
  const genres = ref<Show['genres']>([])
  const totalCount = computed(() => genres.value.length)

  // Watch for changes in the shows store and update genres list accordingly
  watchEffect(() => {
    if (showsStore.all.length === 0) {
      return
    }
    // Push genres to a flat array for easier access in the UI, ensuring uniqueness
    genres.value = showsStore.all.reduce<Show['genres']>((acc, show) => {
      for (const genre of show.genres) {
        if (!acc.includes(genre)) {
          acc.push(genre)
        }
      }
      return acc
    }, [])
  })

  
  return {
    genres,
    totalCount
  }
}
