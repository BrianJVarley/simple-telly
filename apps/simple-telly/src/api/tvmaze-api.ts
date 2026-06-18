import { ApiErrorTypes } from '@/types/apiErrorModel'
import type { SearchResult, Show, Episode } from '@/types/tvShowModel'

const BASE_URL = import.meta.env.VITE_TV_MAZE_API_BASE_URL ?? 'https://api.tvmaze.com'

function createApiError(message: string, cause: keyof typeof ApiErrorTypes): Error {
  const error = new Error(message) as Error & { cause?: keyof typeof ApiErrorTypes }
  error.cause = cause
  return error
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${path}`
  const response = init ? await fetch(url, init) : await fetch(url)
  errorStatusHandler(response)
  return response.json() as Promise<T>
}

export const tvmazeApi = {
  searchShows: (query: string, options?: { signal?: AbortSignal }) =>
    apiFetch<SearchResult[]>(`/search/shows?q=${encodeURIComponent(query)}`, {
      signal: options?.signal,
    }),

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
      throw createApiError('Page not found', ApiErrorTypes['Not Found'])
    } else if (response.status >= 500) {
      throw createApiError('Please try again later', ApiErrorTypes['Server Error'])
    } else if (response.status >= 400 && response.status < 500) {
      throw createApiError('Refresh your browser window', ApiErrorTypes['Request Error'])
    }
    throw createApiError('An unexpected error occurred', ApiErrorTypes['Unknown Error'])
  }
}
