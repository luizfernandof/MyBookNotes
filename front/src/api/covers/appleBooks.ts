import { CoverSearchError, type CoverCandidate, type CoverProvider } from './types'

// iTunes Search API (catálogo da Apple Books): sem chave, CORS liberado e boa
// cobertura de edições brasileiras. Limite de ~20 buscas por minuto por IP.
// https://performance-partners.apple.com/search-api

const SEARCH_URL = 'https://itunes.apple.com/search'
const RESULT_LIMIT = 24

interface SearchResponse {
  results: {
    trackId: number
    trackName: string
    artistName?: string
    releaseDate?: string
    artworkUrl100?: string
  }[]
}

// As URLs de capa terminam em ".../100x100bb.jpg"; trocar o tamanho devolve a imagem maior
function resize(artworkUrl: string, size: number) {
  return artworkUrl.replace(/\/\d+x\d+bb\./, `/${size}x${size}bb.`)
}

export const appleBooks: CoverProvider = {
  id: 'apple-books',
  label: 'Apple Books',
  attributionUrl: 'https://www.apple.com/br/apple-books/',

  async search(query, signal) {
    const params = new URLSearchParams({
      term: `${query.title} ${query.author}`.trim(),
      media: 'ebook',
      entity: 'ebook',
      country: 'BR',
      limit: String(RESULT_LIMIT),
    })

    const response = await fetch(`${SEARCH_URL}?${params}`, { signal })
    if (response.status === 403 || response.status === 429) {
      throw new CoverSearchError('Muitas buscas seguidas na Apple Books. Aguarde um minuto e tente de novo.')
    }
    if (!response.ok) throw new CoverSearchError(`A Apple Books respondeu com erro ${response.status}.`)

    const data: SearchResponse = await response.json()
    return data.results
      .filter((item) => item.artworkUrl100)
      .map((item): CoverCandidate => ({
        key: String(item.trackId),
        title: item.trackName,
        author: item.artistName ?? null,
        year: item.releaseDate ? Number(item.releaseDate.slice(0, 4)) : null,
        thumbnailUrl: resize(item.artworkUrl100!, 300),
        coverUrl: resize(item.artworkUrl100!, 600),
      }))
  },
}
