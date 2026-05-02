import { describe, it, expect, vi, beforeEach } from 'vitest'
import { tvmazeApi } from '../tvmaze-api'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

function mockResponse(body: unknown, ok = true, status = 200) {
  mockFetch.mockResolvedValueOnce({
    ok,
    status,
    statusText: ok ? 'OK' : 'Not Found',
    json: () => Promise.resolve(body),
  })
}

beforeEach(() => {
  mockFetch.mockReset()
})

describe('tvmazeApi', () => {
  describe('searchShows', () => {
    it('calls the correct endpoint and returns data', async () => {
      const data = [{ score: 1, show: { id: 1, name: 'Breaking Bad' } }]
      mockResponse(data)
      const result = await tvmazeApi.searchShows('breaking bad')
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/search/shows?q=breaking%20bad'),
      )
      expect(result).toEqual(data)
    })

    it('encodes special characters in query', async () => {
      mockResponse([])
      await tvmazeApi.searchShows('G&A Beo')
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('G%26A%20Beo'))
    })
  })

  describe('getShow', () => {
    it('calls /shows/:id and returns show data', async () => {
      const show = { id: 42, name: 'The Wire' }
      mockResponse(show)
      const result = await tvmazeApi.getShow(42)
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/shows/42'))
      expect(result).toEqual(show)
    })
  })

  describe('getShowEpisodes', () => {
    it('calls /shows/:id/episodes', async () => {
      const episodes = [{ id: 1, season: 1, number: 1 }]
      mockResponse(episodes)
      const result = await tvmazeApi.getShowEpisodes(42)
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/shows/42/episodes'))
      expect(result).toEqual(episodes)
    })
  })

  describe('getShows', () => {
    it('defaults to page 1 query param', async () => {
      mockResponse([])
      await tvmazeApi.getShows()
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('page=1'))
    })

    it('uses provided page number', async () => {
      mockResponse([])
      await tvmazeApi.getShows(5)
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('page=5'))
    })
  })

  describe('error handling', () => {
    it('throws on non-ok response', async () => {
      mockResponse(null, false, 404)
      await expect(tvmazeApi.getShow(999)).rejects.toThrow('Page not found: 404 Not Found')
    })
  })
})
