import Add from '@mui/icons-material/Add'
import Search from '@mui/icons-material/Search'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import InputAdornment from '@mui/material/InputAdornment'
import MenuItem from '@mui/material/MenuItem'
import Pagination from '@mui/material/Pagination'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useCallback, useEffect, useState } from 'react'
import { Link as RouterLink, useSearchParams } from 'react-router'
import { deleteBook, listBooks } from '../api/books'
import { ApiError } from '../api/client'
import { READING_STATUSES, READING_STATUS_LABELS, type Book, type Page } from '../api/types'
import { BookCard } from '../components/books/BookCard'
import { ConfirmDialog } from '../components/feedback/ConfirmDialog'
import { EmptyState } from '../components/feedback/EmptyState'
import { LoadingState } from '../components/feedback/LoadingState'
import { LIMITS } from '../validation'

const PAGE_SIZE = 12
const SEARCH_DELAY_MS = 300

function parseStatus(value: string | null) {
  return READING_STATUSES.find((status) => status === value)
}

function parseMinRate(value: string | null) {
  const rate = Number(value)
  return Number.isInteger(rate) && rate >= 1 && rate <= LIMITS.rateMax ? rate : undefined
}

export function BooksPage() {
  // Os filtros ficam na URL para sobreviver à ida e volta da tela de edição
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Math.max(Number(searchParams.get('page')) || 0, 0)
  const q = searchParams.get('q') ?? ''
  const status = parseStatus(searchParams.get('status'))
  const minRate = parseMinRate(searchParams.get('minRate'))
  const hasFilters = q !== '' || status !== undefined || minRate !== undefined
  const [searchText, setSearchText] = useState(q)
  const [reloadKey, setReloadKey] = useState(0)
  const [data, setData] = useState<Page<Book> | null>(null)
  const [error, setError] = useState('')
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null)
  const [deleting, setDeleting] = useState(false)

  const updateParams = useCallback(
    (changes: Record<string, string>) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current)
          Object.entries(changes).forEach(([key, value]) => (value ? next.set(key, value) : next.delete(key)))
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  function clearFilters() {
    setSearchText('')
    setSearchParams({}, { replace: true })
  }

  // Espera a pessoa parar de digitar antes de consultar a API
  useEffect(() => {
    const text = searchText.trim()
    if (text === q) return
    const timer = setTimeout(() => updateParams({ q: text, page: '' }), SEARCH_DELAY_MS)
    return () => clearTimeout(timer)
  }, [searchText, q, updateParams])

  useEffect(() => {
    let cancelled = false
    listBooks(page, PAGE_SIZE, { q, status, minRate })
      .then((result) => {
        if (cancelled) return
        // Se a página ficou vazia (ex.: apagou o último livro dela), volta uma
        if (result.content.length === 0 && page > 0) {
          updateParams({ page: page > 1 ? String(page - 1) : '' })
          return
        }
        setData(result)
        setError('')
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof ApiError ? e.message : 'Não foi possível carregar os livros')
      })
    return () => {
      cancelled = true
    }
  }, [page, q, status, minRate, reloadKey, updateParams])

  async function confirmDelete() {
    if (!bookToDelete) return
    setDeleting(true)
    try {
      await deleteBook(bookToDelete.id)
      setReloadKey((key) => key + 1)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Não foi possível apagar o livro')
    } finally {
      setDeleting(false)
      setBookToDelete(null)
    }
  }

  const newBookButton = (
    <Button variant="contained" startIcon={<Add />} component={RouterLink} to="/books/new">
      Novo livro
    </Button>
  )

  return (
    <>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 3, gap: 2 }}>
        <Typography variant="h1">Meus livros</Typography>
        {newBookButton}
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {!data && !error && <LoadingState />}

      {(hasFilters || (data && data.content.length > 0)) && (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
          <TextField
            label="Buscar por título ou autor"
            size="small"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            slotProps={{
              htmlInput: { maxLength: LIMITS.textMax },
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />
          <TextField
            select
            label="Status"
            size="small"
            value={status ?? ''}
            onChange={(event) => updateParams({ status: event.target.value, page: '' })}
            sx={{ minWidth: { sm: 160 } }}
          >
            <MenuItem value="">Todos</MenuItem>
            {READING_STATUSES.map((value) => (
              <MenuItem key={value} value={value}>{READING_STATUS_LABELS[value]}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Nota mínima"
            size="small"
            value={minRate ?? ''}
            onChange={(event) => updateParams({ minRate: event.target.value, page: '' })}
            sx={{ minWidth: { sm: 150 } }}
          >
            <MenuItem value="">Qualquer</MenuItem>
            {[1, 2, 3, 4, 5].map((value) => (
              <MenuItem key={value} value={value}>{value === 5 ? '5 estrelas' : `${value}+ estrelas`}</MenuItem>
            ))}
          </TextField>
        </Stack>
      )}

      {data && data.content.length === 0 && (
        hasFilters ? (
          <EmptyState
            message="Nenhum livro encontrado com esses filtros."
            action={<Button onClick={clearFilters}>Limpar filtros</Button>}
          />
        ) : (
          <EmptyState message="Você ainda não cadastrou nenhum livro." action={newBookButton} />
        )
      )}

      {data && data.content.length > 0 && (
        <>
          <Box
            component="ul"
            sx={{
              listStyle: 'none',
              p: 0,
              m: 0,
              display: 'grid',
              gap: 2,
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(auto-fill, minmax(340px, 1fr))' },
            }}
          >
            {data.content.map((book) => (
              <li key={book.id}>
                <BookCard book={book} onDelete={setBookToDelete} />
              </li>
            ))}
          </Box>

          {data.page.totalPages > 1 && (
            <Pagination
              count={data.page.totalPages}
              page={page + 1}
              onChange={(_, value) => updateParams({ page: value > 1 ? String(value - 1) : '' })}
              color="primary"
              sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}
            />
          )}
        </>
      )}

      <ConfirmDialog
        open={bookToDelete !== null}
        title="Apagar livro?"
        description={bookToDelete ? `"${bookToDelete.title}" será removido permanentemente.` : ''}
        confirmLabel="Apagar"
        loading={deleting}
        onConfirm={confirmDelete}
        onClose={() => setBookToDelete(null)}
      />
    </>
  )
}
