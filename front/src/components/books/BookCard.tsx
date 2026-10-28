import DeleteOutlined from '@mui/icons-material/DeleteOutlined'
import EditOutlined from '@mui/icons-material/EditOutlined'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import Rating from '@mui/material/Rating'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Link as RouterLink } from 'react-router'
import type { Book } from '../../api/types'
import { LIMITS } from '../../validation'
import { BookCover } from './BookCover'
import { StatusChip } from './StatusChip'

function formatDate(isoDate: string) {
  const [year, month, day] = isoDate.split('-')
  return `${day}/${month}/${year}`
}

export function BookCard({ book, onDelete }: { book: Book; onDelete: (book: Book) => void }) {
  return (
    <Card component="article" sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Stack direction="row" spacing={2} sx={{ p: 2, flex: 1, minWidth: 0 }}>
        <BookCover title={book.title} coverUrl={book.coverUrl} />
        <Stack spacing={0.5} sx={{ minWidth: 0, flex: 1 }}>
          <StatusChip status={book.status} />
          <Typography variant="h2" sx={{ pt: 0.5, overflowWrap: 'anywhere' }}>{book.title}</Typography>
          <Typography color="text.secondary">{book.author}</Typography>
          {book.rate !== null && (
            <Rating value={book.rate} max={LIMITS.rateMax} readOnly size="small" />
          )}
          {book.finishedAt && (
            <Typography variant="body2" color="text.secondary">
              Terminado em {formatDate(book.finishedAt)}
            </Typography>
          )}
          {book.summary && (
            <Box
              component="p"
              sx={{
                m: 0,
                pt: 0.5,
                typography: 'body2',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {book.summary}
            </Box>
          )}
        </Stack>
      </Stack>
      <CardActions sx={{ justifyContent: 'flex-end', borderTop: 1, borderColor: 'divider' }}>
        <Button size="small" startIcon={<EditOutlined />} component={RouterLink} to={`/books/${book.id}/edit`}>
          Editar
        </Button>
        <Button size="small" color="error" startIcon={<DeleteOutlined />} onClick={() => onDelete(book)}>
          Apagar
        </Button>
      </CardActions>
    </Card>
  )
}
