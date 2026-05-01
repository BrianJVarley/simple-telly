import { computed, ref, watch } from 'vue'
import { tvmazeApi } from '@/api/tvmaze-api'
import { useShowsStore } from '@/stores/shows'
import type { Show, Episode } from '@/types/tvShowModel'
import type { ApiErrorTypes } from '@/types/apiErrorModel'
export function useShowDetail(showId: number) {
  const showsStore = useShowsStore()

  const show = ref<Show | null>(null)
  const episodes = ref<Episode[]>([])
  const isLoading = ref(false)
  const error = ref<{ message: string; cause?: keyof typeof ApiErrorTypes | undefined } | null>(
    null,
  )

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
      if (err instanceof Error) {
        error.value = {
          message: err.message,
          cause: (err as Error).cause as keyof typeof ApiErrorTypes | undefined,
        }
      } else {
        error.value = { message: 'Failed to load show' }
      }
    } finally {
      isLoading.value = false
    }
  }

  const seasonCount = computed(() => {
    const seasons = new Set(episodes.value.map((ep) => ep.season))
    return seasons.size
  })

  const episodesBySeason = (): Map<number, Episode[]> => {
    return episodes.value.reduce((map, ep) => {
      const list = map.get(ep.season) ?? []
      list.push(ep)
      map.set(ep.season, list)
      return map
    }, new Map<number, Episode[]>())
  }

  watch(() => showId, fetchShow, { immediate: true })

  return { show, episodes, episodesBySeason, seasonCount, isLoading, error, fetchShow }
}
