import { ApiErrorTypes } from '@/types/apiErrorModel'
import type { SearchResult, Show, Episode } from '@/types/tvShowModel'

const BASE_URL = 'https://api.tvmaze.com'
async function apiFetch<T>(path: string): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`)
  if (!response.ok) {

    if (response.status === 404) {
      throw new Error(`Page not found: ${response.status} ${response.statusText}`, {
        cause: ApiErrorTypes['Not Found'],
      })
    }
    throw new Error(`API error: ${response.status} ${response.statusText}`)
  }
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
