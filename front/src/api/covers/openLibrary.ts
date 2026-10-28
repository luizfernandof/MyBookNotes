import { CoverSearchError, type CoverCandidate, type CoverProvider } from './types'

// Open Library (https://openlibrary.org/developers/api): sem chave e com CORS liberado.
// Bom para clássicos e edições estrangeiras. A capa é buscada pelo ID (cover_i),
// que não tem limite de requisições; por ISBN teria.

const SEARCH_URL = 'https://openlibrary.org/search.json'
const COVERS_URL = 'https://covers.openlibrary.org/b/id'
const RESULT_LIMIT = 24

interface SearchResponse {
  docs: {
    key: string
    title: string
    author_name?: string[]
    first_publish_year?: number
    cover_i?: number
  }[]
}

function coverImageUrl(coverId: number, size: 'S' | 'M' | 'L') {
  return `${COVERS_URL}/${coverId}-${size}.jpg`
}

export const openLibrary: CoverProvider = {
  id: 'open-library',
  label: 'Open Library',
  attributionUrl: 'https://openlibrary.org',

  async search(query, signal) {
    const params = new URLSearchParams({
      fields: 'key,title,author_name,first_publish_year,cover_i',
      limit: String(RESULT_LIMIT),
    })
    if (query.title.trim()) params.set('title', query.title.trim())
    if (query.author.trim()) params.set('author', query.author.trim())

    const response = await fetch(`${SEARCH_URL}?${params}`, { signal })
    if (!response.ok) throw new CoverSearchError(`A Open Library respondeu com erro ${response.status}.`)

    const data: SearchResponse = await response.json()
    return data.docs
      .filter((doc) => doc.cover_i !== undefined)
      .map((doc): CoverCandidate => ({
        key: doc.key,
        title: doc.title,
        author: doc.author_name?.[0] ?? null,
        year: doc.first_publish_year ?? null,
        thumbnailUrl: coverImageUrl(doc.cover_i!, 'M'),
        coverUrl: coverImageUrl(doc.cover_i!, 'L'),
      }))
  },
}
