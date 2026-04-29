export interface Show {
  id: number
  name: string
  type: string
  language: string
  genres: string[]
  status: string
  rating: { average: number | null }
  network: { id: number; name: string } | null
  summary: string | null
  image: { medium: string; original: string } | null
  premiered: string | null
  officialSite: string | null
}

export interface Episode {
  id: number
  name: string
  season: number
  number: number | null
  airdate: string
  airtime: string
  runtime: number | null
  summary: string | null
  image: { medium: string; original: string } | null
  show?: Show
}

export interface SearchResult {
  score: number
  show: Show
}
