import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { createBook, getBook, updateBook } from '../api/books'
import { ApiError } from '../api/client'
import { READING_STATUS_LABELS, READING_STATUSES, type Book } from '../api/types'
import { Field } from '../components/Field'
import { fieldA11y } from '../components/fieldA11y'
import { hasErrors, LIMITS, toBookRequest, validateBook, type BookForm, type FieldErrors } from '../validation'

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

  const [form, setForm] = useState<BookForm>(EMPTY_FORM)
  const [errors, setErrors] = useState<FieldErrors<BookForm>>({})
  const [submitted, setSubmitted] = useState(false)
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(isEdit)
  const [notFound, setNotFound] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!id) return
    getBook(id)
      .then((book) => setForm(toForm(book)))
      .catch((e) => {
        if (e instanceof ApiError && e.status === 404) setNotFound(true)
        else setFormError('Não foi possível carregar o livro')
      })
      .finally(() => setLoading(false))
  }, [id])

  function update(field: keyof BookForm, value: string) {
    const next = { ...form, [field]: value }
    setForm(next)
    if (submitted) setErrors(validateBook(next))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitted(true)
    setFormError('')
    const validation = validateBook(form)
    setErrors(validation)
    if (hasErrors(validation)) return

    setSubmitting(true)
    try {
      const request = toBookRequest(form)
      if (id) await updateBook(id, request)
      else await createBook(request)
      navigate('/books')
    } catch (e) {
      if (e instanceof ApiError) {
        setErrors(e.fieldErrors)
        setFormError(e.status === 404 ? 'Este livro não existe mais' : e.message)
      } else {
        setFormError('Não foi possível salvar o livro')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <p className="muted">Carregando…</p>
  if (notFound) {
    return (
      <div className="card empty">
        <p>Livro não encontrado.</p>
        <Link to="/books" className="button primary">Voltar para a lista</Link>
      </div>
    )
  }

  return (
    <form className="card book-form" onSubmit={handleSubmit} noValidate>
      <h1>{isEdit ? 'Editar livro' : 'Novo livro'}</h1>
      {formError && <p className="notice error" role="alert">{formError}</p>}

      <Field id="title" label="Título *" error={errors.title}>
        <input {...fieldA11y('title', errors.title)} maxLength={LIMITS.textMax}
          value={form.title} onChange={(e) => update('title', e.target.value)} />
      </Field>

      <Field id="author" label="Autor *" error={errors.author}>
        <input {...fieldA11y('author', errors.author)} maxLength={LIMITS.textMax}
          value={form.author} onChange={(e) => update('author', e.target.value)} />
      </Field>

      <div className="row">
        <Field id="status" label="Status *" error={errors.status}>
          <select {...fieldA11y('status', errors.status)} value={form.status}
            onChange={(e) => update('status', e.target.value)}>
            <option value="">Selecione…</option>
            {READING_STATUSES.map((status) => (
              <option key={status} value={status}>{READING_STATUS_LABELS[status]}</option>
            ))}
          </select>
        </Field>

        <Field id="rate" label="Nota" error={errors.rate}>
          <select {...fieldA11y('rate', errors.rate)} value={form.rate}
            onChange={(e) => update('rate', e.target.value)}>
            <option value="">Sem nota</option>
            {Array.from({ length: LIMITS.rateMax - LIMITS.rateMin + 1 }, (_, i) => LIMITS.rateMin + i).map((rate) => (
              <option key={rate} value={rate}>{rate} {rate === 1 ? 'estrela' : 'estrelas'}</option>
            ))}
          </select>
        </Field>

        <Field id="finishedAt" label="Terminado em" error={errors.finishedAt}>
          <input {...fieldA11y('finishedAt', errors.finishedAt)} type="date"
            value={form.finishedAt} onChange={(e) => update('finishedAt', e.target.value)} />
        </Field>
      </div>

      <Field id="coverUrl" label="URL da capa" error={errors.coverUrl}>
        <input {...fieldA11y('coverUrl', errors.coverUrl)} type="url" maxLength={LIMITS.textMax}
          placeholder="https://…" value={form.coverUrl} onChange={(e) => update('coverUrl', e.target.value)} />
      </Field>

      <Field id="summary" label="Resumo / anotações" error={errors.summary}>
        <textarea {...fieldA11y('summary', errors.summary)} rows={6}
          value={form.summary} onChange={(e) => update('summary', e.target.value)} />
      </Field>

      <div className="actions">
        <Link to="/books" className="button ghost">Cancelar</Link>
        <button type="submit" className="button primary" disabled={submitting}>
          {submitting ? 'Salvando…' : 'Salvar'}
        </button>
      </div>
    </form>
  )
}
