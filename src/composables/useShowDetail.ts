import { ref, watch } from 'vue'
import { tvmazeApi } from '@/api/tvmaze-api'
import { useShowsStore } from '@/stores/shows'
import type { Show, Episode } from '@/types/tvShowModel'
export function useShowDetail(showId: number) {
  const showsStore = useShowsStore()

  const show = ref<Show | null>(null)
  const episodes = ref<Episode[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchShow(id: number) {
    const cached = showsStore.getById(id)
    if (cached) {
      show.value = cached
    }

    isLoading.value = true
    error.value = null

    try {
      const [showData, episodeData] = await Promise.all([
        tvmazeApi.getShow(id),
        tvmazeApi.getShowEpisodes(id),
      ])
      show.value = showData
      episodes.value = episodeData
      showsStore.upsert(showData)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load show'
    } finally {
      isLoading.value = false
    }
  }

  const episodesBySeason = (): Map<number, Episode[]> => {
    return episodes.value.reduce((map, ep) => {
      const list = map.get(ep.season) ?? []
      list.push(ep)
      map.set(ep.season, list)
      return map
    }, new Map<number, Episode[]>())
  }

  watch(() => showId, fetchShow, { immediate: true })

  return { show, episodes, episodesBySeason, isLoading, error, fetchShow }
}
