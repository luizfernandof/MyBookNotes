import Add from '@mui/icons-material/Add'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Pagination from '@mui/material/Pagination'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useEffect, useState } from 'react'
import { Link as RouterLink } from 'react-router'
import { deleteBook, listBooks } from '../api/books'
import { ApiError } from '../api/client'
import type { Book, Page } from '../api/types'
import { BookCard } from '../components/books/BookCard'
import { ConfirmDialog } from '../components/feedback/ConfirmDialog'
import { EmptyState } from '../components/feedback/EmptyState'
import { LoadingState } from '../components/feedback/LoadingState'

const PAGE_SIZE = 12

export function BooksPage() {
  const [page, setPage] = useState(0)
  const [reloadKey, setReloadKey] = useState(0)
  const [data, setData] = useState<Page<Book> | null>(null)
  const [error, setError] = useState('')
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    let cancelled = false
    listBooks(page, PAGE_SIZE)
      .then((result) => {
        if (cancelled) return
        // Se a página ficou vazia (ex.: apagou o último livro dela), volta uma
        if (result.content.length === 0 && page > 0) {
          setPage(page - 1)
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
  }, [page, reloadKey])

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

      {data && data.content.length === 0 && (
        <EmptyState message="Você ainda não cadastrou nenhum livro." action={newBookButton} />
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
              onChange={(_, value) => setPage(value - 1)}
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
