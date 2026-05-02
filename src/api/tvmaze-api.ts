import { ApiErrorTypes } from '@/types/apiErrorModel'
import type { SearchResult, Show, Episode } from '@/types/tvShowModel'

const BASE_URL = import.meta.env.VITE_TV_MAZE_API_BASE_URL ?? 'https://api.tvmaze.com'

async function apiFetch<T>(path: string): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`)
  errorStatusHandler(response)
  return response.json() as Promise<T>
}

export const tvmazeApi = {
  searchShows: (query: string) =>
    apiFetch<SearchResult[]>(`/search/shows?q=${encodeURIComponent(query)}`),

  getShow: (id: number) => apiFetch<Show>(`/shows/${id}`),

  getShowEpisodes: (showId: number) => apiFetch<Episode[]>(`/shows/${showId}/episodes`),

  getEpisode: (episodeId: number) => apiFetch<Episode>(`/episodes/${episodeId}`),

  getShows: (page: number = 1) => apiFetch<Show[]>(`/shows?page=${page}`),
}

/**
 * Handle HTTP error statuses by throwing an error with a user-friendly message 
 * @param response 
 */
function errorStatusHandler(response: Response) {
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Page not found`, {
        cause: ApiErrorTypes['Not Found'],
      })
    } else if (response.status >= 500) {
      throw new Error(`Please try again later`, {
        cause: ApiErrorTypes['Server Error'],
      })
    } else if (response.status >= 400 && response.status < 500) {
      throw new Error(`Refresh your browser window`, {
        cause: ApiErrorTypes['Request Error'],
      })
    }
    throw new Error(`An unexpected error occurred`, {
      cause: ApiErrorTypes['Unknown Error'],
    })
  }
}

