import { appleBooks } from './appleBooks'
import { openLibrary } from './openLibrary'
import type { CoverProvider } from './types'

// A primeira fonte é a usada por padrão no diálogo de busca
export const COVER_PROVIDERS: CoverProvider[] = [appleBooks, openLibrary]

export * from './types'
