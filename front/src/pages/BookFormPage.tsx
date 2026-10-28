import ImageSearchOutlined from '@mui/icons-material/ImageSearchOutlined'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import FormLabel from '@mui/material/FormLabel'
import MenuItem from '@mui/material/MenuItem'
import Rating from '@mui/material/Rating'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useEffect, useState, type FormEvent } from 'react'
import { Link as RouterLink, useNavigate, useParams } from 'react-router'
import { createBook, getBook, updateBook } from '../api/books'
import { ApiError } from '../api/client'
import type { CoverCandidate } from '../api/covers'
import { READING_STATUS_LABELS, READING_STATUSES, type Book } from '../api/types'
import { BookCover } from '../components/books/BookCover'
import { CoverSearchDialog } from '../components/books/CoverSearchDialog'
import { EmptyState } from '../components/feedback/EmptyState'
import { LoadingState } from '../components/feedback/LoadingState'
import { useValidatedForm } from '../hooks/useValidatedForm'
import { LIMITS, toBookRequest, validateBook, type BookForm } from '../validation'

const EMPTY_FORM: BookForm = {
  title: '',
  author: '',
  rate: '',
  summary: '',
  finishedAt: '',
  coverUrl: '',
  status: '',
}

function toForm(book: Book): BookForm {
  return {
    title: book.title,
    author: book.author,
    rate: book.rate === null ? '' : String(book.rate),
    summary: book.summary ?? '',
    finishedAt: book.finishedAt ?? '',
    coverUrl: book.coverUrl ?? '',
    status: book.status,
  }
}

export function BookFormPage() {
  const { id } = useParams()
  const isEdit = id !== undefined
  const navigate = useNavigate()

  const form = useValidatedForm(EMPTY_FORM, validateBook)
  const { setValues } = form
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(isEdit)
  const [notFound, setNotFound] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [coverSearchOpen, setCoverSearchOpen] = useState(false)

  useEffect(() => {
    if (!id) return
    getBook(id)
      .then((book) => setValues(toForm(book)))
      .catch((e) => {
        if (e instanceof ApiError && e.status === 404) setNotFound(true)
        else setFormError('Não foi possível carregar o livro')
      })
      .finally(() => setLoading(false))
  }, [id, setValues])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setFormError('')
    if (!form.validateAll()) return

    setSubmitting(true)
    try {
      const request = toBookRequest(form.values)
      if (id) await updateBook(id, request)
      else await createBook(request)
      navigate('/books')
    } catch (e) {
      if (e instanceof ApiError) {
        form.setServerErrors(e.fieldErrors)
        setFormError(e.status === 404 ? 'Este livro não existe mais' : e.message)
      } else {
        setFormError('Não foi possível salvar o livro')
      }
    } finally {
      setSubmitting(false)
    }
  }

  // Usa a capa escolhida e aproveita título/autor da fonte só se ainda estiverem vazios
  function handleCoverSelected(candidate: CoverCandidate) {
    const { title, author } = form.values
    form.setFields({
      coverUrl: candidate.coverUrl,
      ...(title.trim() === '' && { title: candidate.title.slice(0, LIMITS.textMax) }),
      ...(author.trim() === '' && candidate.author && { author: candidate.author.slice(0, LIMITS.textMax) }),
    })
    setCoverSearchOpen(false)
  }

  if (loading) return <LoadingState />
  if (notFound) {
    return (
      <EmptyState
        message="Livro não encontrado."
        action={<Button variant="contained" component={RouterLink} to="/books">Voltar para a lista</Button>}
      />
    )
  }

  const rateValue = form.values.rate === '' ? null : Number(form.values.rate)

  return (
    <Card sx={{ maxWidth: 760, mx: 'auto' }}>
      <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
        <Typography variant="h1" sx={{ mb: 3 }}>{isEdit ? 'Editar livro' : 'Novo livro'}</Typography>

        <Stack component="form" spacing={2.5} onSubmit={handleSubmit} noValidate>
          {formError && <Alert severity="error">{formError}</Alert>}

          <TextField label="Título" required slotProps={{ htmlInput: { maxLength: LIMITS.textMax } }}
            {...form.bind('title')} />
          <TextField label="Autor" required slotProps={{ htmlInput: { maxLength: LIMITS.textMax } }}
            {...form.bind('author')} />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5}>
            <TextField select label="Status" required {...form.bind('status')}>
              {READING_STATUSES.map((status) => (
                <MenuItem key={status} value={status}>{READING_STATUS_LABELS[status]}</MenuItem>
              ))}
            </TextField>
            <TextField label="Terminado em" type="date" slotProps={{ inputLabel: { shrink: true } }}
              {...form.bind('finishedAt')} />
          </Stack>

          <FormControl error={Boolean(form.errors.rate)}>
            <FormLabel id="rate-label">Nota</FormLabel>
            <Rating
              name="rate"
              aria-labelledby="rate-label"
              value={rateValue}
              max={LIMITS.rateMax}
              size="large"
              onChange={(_, value) => form.setField('rate', value === null ? '' : String(value))}
            />
            <FormHelperText>
              {form.errors.rate ?? 'Opcional. Clique na estrela marcada para remover a nota.'}
            </FormHelperText>
          </FormControl>

          <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
            <BookCover title={form.values.title} coverUrl={form.values.coverUrl.trim() || null} />
            <Stack spacing={1.5} sx={{ flex: 1, minWidth: 0 }}>
              <TextField label="URL da capa" type="url" placeholder="https://…"
                slotProps={{ htmlInput: { maxLength: LIMITS.textMax } }} {...form.bind('coverUrl')} />
              <Button variant="outlined" startIcon={<ImageSearchOutlined />} onClick={() => setCoverSearchOpen(true)}
                sx={{ alignSelf: 'flex-start' }}>
                Buscar capa
              </Button>
            </Stack>
          </Stack>
          <TextField label="Resumo / anotações" multiline minRows={5} {...form.bind('summary')} />

          <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
            <Button component={RouterLink} to="/books" disabled={submitting}>Cancelar</Button>
            <Button type="submit" variant="contained" loading={submitting}>Salvar</Button>
          </Stack>
        </Stack>
      </CardContent>

      <CoverSearchDialog
        open={coverSearchOpen}
        initialQuery={{ title: form.values.title, author: form.values.author }}
        onSelect={handleCoverSelected}
        onClose={() => setCoverSearchOpen(false)}
      />
    </Card>
  )
}
