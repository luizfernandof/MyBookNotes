// Contrato comum das fontes de capa: cada fonte só precisa saber buscar e
// devolver os resultados nesse formato. Para adicionar outra, crie um arquivo
// nesta pasta e registre-o em index.ts.

export interface CoverQuery {
  title: string
  author: string
}

export interface CoverCandidate {
  key: string
  title: string
  author: string | null
  year: number | null
  thumbnailUrl: string // usada na grade de resultados
  coverUrl: string // salva no livro (cabe nos 255 caracteres do campo)
}

export interface CoverProvider {
  id: string
  label: string
  attributionUrl: string
  search: (query: CoverQuery, signal?: AbortSignal) => Promise<CoverCandidate[]>
}

export class CoverSearchError extends Error {}
