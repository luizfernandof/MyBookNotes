import ArrowBack from '@mui/icons-material/ArrowBack'
import EditOutlined from '@mui/icons-material/EditOutlined'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useEffect, useState } from 'react'
import { Link as RouterLink, useLocation, useNavigate, useParams } from 'react-router'
import { getBook } from '../api/books'
import { ApiError } from '../api/client'
import type { Book } from '../api/types'
import { BookCover } from '../components/books/BookCover'
import { EmptyState } from '../components/feedback/EmptyState'
import { LoadingState } from '../components/feedback/LoadingState'

export function BookDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [book, setBook] = useState<Book | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    let cancelled = false
    getBook(id)
      .then((result) => {
        if (!cancelled) setBook(result)
      })
      .catch((e) => {
        if (cancelled) return
        if (e instanceof ApiError && e.status === 404) setNotFound(true)
        else setError('Não foi possível carregar o livro')
      })
    return () => {
      cancelled = true
    }
  }, [id])

  // Voltar pelo histórico preserva os filtros da lista; em acesso direto ao link, vai para a lista
  function goBack() {
    if (location.key === 'default') navigate('/books')
    else navigate(-1)
  }

  if (notFound) {
    return (
      <EmptyState
        message="Livro não encontrado."
        action={<Button variant="contained" component={RouterLink} to="/books">Voltar para a lista</Button>}
      />
    )
  }
  if (error) return <Alert severity="error">{error}</Alert>
  if (!book) return <LoadingState />

  return (
    <Stack spacing={2} sx={{ maxWidth: 760, mx: 'auto' }}>
      <Button startIcon={<ArrowBack />} onClick={goBack} sx={{ alignSelf: 'flex-start' }}>
        Voltar
      </Button>
      <Card component="article">
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
            <BookCover title={book.title} coverUrl={book.coverUrl} size="large" />
            <Stack spacing={1} sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="h1" sx={{ overflowWrap: 'anywhere' }}>{book.title}</Typography>
              <Typography color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>{book.author}</Typography>
              <Typography variant="h2" component="h2" sx={{ pt: 2 }}>Resumo</Typography>
              {book.summary ? (
                <Typography sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{book.summary}</Typography>
              ) : (
                <Typography color="text.secondary">Você ainda não escreveu um resumo para este livro.</Typography>
              )}
            </Stack>
          </Stack>
        </CardContent>
        <CardActions sx={{ justifyContent: 'flex-end', borderTop: 1, borderColor: 'divider' }}>
          <Button size="small" startIcon={<EditOutlined />} component={RouterLink} to={`/books/${book.id}/edit`}>
            Editar
          </Button>
        </CardActions>
      </Card>
    </Stack>
  )
}
