import SearchOutlined from '@mui/icons-material/SearchOutlined'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ButtonBase from '@mui/material/ButtonBase'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import { useEffect, useState, type FormEvent } from 'react'
import {
  COVER_PROVIDERS,
  CoverSearchError,
  type CoverCandidate,
  type CoverProvider,
  type CoverQuery,
} from '../../api/covers'
import { LIMITS } from '../../validation'
import { EmptyState } from '../feedback/EmptyState'
import { LoadingState } from '../feedback/LoadingState'

interface CoverSearchDialogProps {
  open: boolean
  initialQuery: CoverQuery
  onSelect: (candidate: CoverCandidate) => void
  onClose: () => void
}

export function CoverSearchDialog({ open, initialQuery, onSelect, onClose }: CoverSearchDialogProps) {
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" fullScreen={fullScreen}
      aria-labelledby="cover-search-title">
      <DialogTitle id="cover-search-title">Buscar capa</DialogTitle>
      {/* Montado só enquanto aberto: cada abertura começa com o título/autor atuais do formulário */}
      {open && <CoverSearchContent initialQuery={initialQuery} onSelect={onSelect} onClose={onClose} />}
    </Dialog>
  )
}

function hasInput(query: CoverQuery) {
  return query.title.trim() !== '' || query.author.trim() !== ''
}

interface Search extends CoverQuery {
  provider: CoverProvider
}

interface SearchResult {
  search: Search
  candidates?: CoverCandidate[]
  error?: string
}

function CoverSearchContent({ initialQuery, onSelect, onClose }: Omit<CoverSearchDialogProps, 'open'>) {
  const [title, setTitle] = useState(initialQuery.title)
  const [author, setAuthor] = useState(initialQuery.author)
  const [provider, setProvider] = useState(COVER_PROVIDERS[0])
  // Já busca ao abrir se o formulário tiver título ou autor
  const [search, setSearch] = useState<Search | null>(
    hasInput(initialQuery) ? { ...initialQuery, provider: COVER_PROVIDERS[0] } : null,
  )
  const [result, setResult] = useState<SearchResult | null>(null)
  const loading = search !== null && result?.search !== search

  useEffect(() => {
    if (!search) return
    const controller = new AbortController()
    search.provider
      .search(search, controller.signal)
      // Descarta capas cuja URL não caberia no campo coverUrl do livro
      .then((candidates) => setResult({ search, candidates: candidates.filter((c) => c.coverUrl.length <= LIMITS.textMax) }))
      .catch((error) => {
        if (controller.signal.aborted) return
        const message = error instanceof CoverSearchError
          ? error.message
          : `Não foi possível buscar na ${search.provider.label}. Verifique a conexão e tente de novo.`
        setResult({ search, error: message })
      })
    return () => controller.abort()
  }, [search])

  function runSearch(nextProvider: CoverProvider) {
    const query = { title, author }
    if (hasInput(query)) setSearch({ ...query, provider: nextProvider })
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    // O diálogo fica num portal, mas o evento de submit ainda sobe pela árvore do React
    // até o formulário do livro; sem isso, buscar uma capa salvaria o livro.
    event.stopPropagation()
    runSearch(provider)
  }

  function handleProviderChange(id: string | null) {
    const next = COVER_PROVIDERS.find((p) => p.id === id)
    if (!next) return // clicar na fonte já selecionada não a desmarca
    setProvider(next)
    runSearch(next)
  }

  return (
    <>
      <DialogContent dividers>
        <Stack component="form" direction={{ xs: 'column', sm: 'row' }} spacing={2} onSubmit={handleSubmit} noValidate
          sx={{ mb: 2 }}>
          <TextField label="Título" size="small" value={title} onChange={(e) => setTitle(e.target.value)} />
          <TextField label="Autor" size="small" value={author} onChange={(e) => setAuthor(e.target.value)} />
          <Button type="submit" variant="contained" startIcon={<SearchOutlined />}
            disabled={!hasInput({ title, author })} sx={{ flexShrink: 0 }}>
            Buscar
          </Button>
        </Stack>

        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 3 }}>
          <Typography variant="body2" color="text.secondary" id="cover-source-label">Fonte:</Typography>
          <ToggleButtonGroup
            exclusive
            size="small"
            color="primary"
            value={provider.id}
            onChange={(_, id: string | null) => handleProviderChange(id)}
            aria-labelledby="cover-source-label"
          >
            {COVER_PROVIDERS.map((p) => (
              <ToggleButton key={p.id} value={p.id}>{p.label}</ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Stack>

        {!search && <EmptyState message="Informe o título ou o autor para buscar capas." />}
        {loading && <LoadingState />}
        {!loading && result?.error && <Alert severity="error">{result.error}</Alert>}
        {!loading && result?.candidates?.length === 0 && (
          <EmptyState message="Nenhuma capa encontrada. Tente variar o título ou trocar a fonte." />
        )}
        {!loading && result?.candidates && result.candidates.length > 0 && (
          <CoverGrid candidates={result.candidates} onSelect={onSelect} />
        )}
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between', px: 3 }}>
        <Typography variant="caption" color="text.secondary">
          Capas via <Link href={provider.attributionUrl} target="_blank" rel="noopener">{provider.label}</Link>
        </Typography>
        <Button onClick={onClose}>Fechar</Button>
      </DialogActions>
    </>
  )
}

function CoverGrid({ candidates, onSelect }: { candidates: CoverCandidate[]; onSelect: (c: CoverCandidate) => void }) {
  return (
    <Box
      component="ul"
      sx={{
        listStyle: 'none',
        p: 0,
        m: 0,
        display: 'grid',
        gap: 2,
        gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
      }}
    >
      {candidates.map((candidate) => (
        <li key={candidate.key}>
          <ButtonBase
            onClick={() => onSelect(candidate)}
            aria-label={`Usar capa de ${candidate.title}${candidate.year ? ` (${candidate.year})` : ''}`}
            sx={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
              textAlign: 'left',
              borderRadius: 1.5,
              p: 1,
              border: 1,
              borderColor: 'divider',
              '&:hover, &.Mui-focusVisible': { borderColor: 'primary.main' },
            }}
          >
            <Box
              component="img"
              src={candidate.thumbnailUrl}
              alt=""
              loading="lazy"
              sx={{ width: '100%', aspectRatio: '2 / 3', objectFit: 'cover', borderRadius: 1, bgcolor: 'divider' }}
            />
            <Typography variant="body2" sx={{
              mt: 1,
              fontWeight: 500,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}>
              {candidate.title}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {[candidate.author, candidate.year].filter(Boolean).join(' · ')}
            </Typography>
          </ButtonBase>
        </li>
      ))}
    </Box>
  )
}
