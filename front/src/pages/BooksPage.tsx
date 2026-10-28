import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { deleteBook, listBooks } from '../api/books'
import { ApiError } from '../api/client'
import { READING_STATUS_LABELS, type Book, type Page } from '../api/types'
import { LIMITS } from '../validation'

const PAGE_SIZE = 12

function formatDate(isoDate: string) {
  const [year, month, day] = isoDate.split('-')
  return `${day}/${month}/${year}`
}

function Stars({ rate }: { rate: number }) {
  return (
    <span className="stars" aria-label={`Nota ${rate} de ${LIMITS.rateMax}`}>
      {'★'.repeat(rate)}
      <span className="stars-empty">{'★'.repeat(LIMITS.rateMax - rate)}</span>
    </span>
  )
}

export function BooksPage() {
  const [page, setPage] = useState(0)
  const [reloadKey, setReloadKey] = useState(0)
  const [data, setData] = useState<Page<Book> | null>(null)
  const [error, setError] = useState('')

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

  async function handleDelete(book: Book) {
    if (!confirm(`Apagar "${book.title}"?`)) return
    try {
      await deleteBook(book.id)
      setReloadKey((key) => key + 1)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Não foi possível apagar o livro')
    }
  }

  return (
    <>
      <div className="page-header">
        <h1>Meus livros</h1>
        <Link to="/books/new" className="button primary">Novo livro</Link>
      </div>

      {error && <p className="notice error" role="alert">{error}</p>}
      {!data && !error && <p className="muted">Carregando…</p>}

      {data && data.content.length === 0 && (
        <div className="card empty">
          <p>Você ainda não cadastrou nenhum livro.</p>
          <Link to="/books/new" className="button primary">Cadastrar o primeiro</Link>
        </div>
      )}

      {data && data.content.length > 0 && (
        <>
          <ul className="book-grid">
            {data.content.map((book) => (
              <li key={book.id} className="card book-card">
                {book.coverUrl ? (
                  <img className="cover" src={book.coverUrl} alt="" loading="lazy" />
                ) : (
                  <div className="cover cover-placeholder" aria-hidden="true">{book.title.charAt(0)}</div>
                )}
                <div className="book-info">
                  <span className={`badge status-${book.status.toLowerCase()}`}>
                    {READING_STATUS_LABELS[book.status]}
                  </span>
                  <h2>{book.title}</h2>
                  <p className="muted">{book.author}</p>
                  {book.rate !== null && <Stars rate={book.rate} />}
                  {book.finishedAt && <p className="muted small">Terminado em {formatDate(book.finishedAt)}</p>}
                  {book.summary && <p className="summary">{book.summary}</p>}
                  <div className="actions">
                    <Link to={`/books/${book.id}/edit`} className="button ghost">Editar</Link>
                    <button type="button" className="button ghost danger" onClick={() => handleDelete(book)}>
                      Apagar
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {data.page.totalPages > 1 && (
            <nav className="pagination" aria-label="Paginação">
              <button type="button" className="button ghost" disabled={page === 0} onClick={() => setPage(page - 1)}>
                Anterior
              </button>
              <span className="muted">Página {page + 1} de {data.page.totalPages}</span>
              <button type="button" className="button ghost" disabled={page + 1 >= data.page.totalPages}
                onClick={() => setPage(page + 1)}>
                Próxima
              </button>
            </nav>
          )}
        </>
      )}
    </>
  )
}
