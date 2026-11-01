import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'

const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
const CHART_HEIGHT = 140

function booksLabel(count: number) {
  return count === 1 ? '1 livro' : `${count} livros`
}

// Barras horizontais: o rótulo identifica a barra e o valor fica sempre visível
export function BarList({ items }: { items: { label: string; value: number }[] }) {
  const max = Math.max(...items.map((item) => item.value), 1)
  return (
    <Stack component="ul" spacing={1.25} sx={{ listStyle: 'none', p: 0, m: 0 }}>
      {items.map((item) => (
        <li key={item.label}>
          <Stack direction="row" sx={{ justifyContent: 'space-between', gap: 2, mb: 0.5 }}>
            <Typography variant="body2" noWrap>{item.label}</Typography>
            <Typography variant="body2" color="text.secondary">{item.value}</Typography>
          </Stack>
          <Box sx={{ height: 8, bgcolor: 'divider', borderRadius: 1 }}>
            <Box
              sx={{
                height: 1,
                width: `${(item.value / max) * 100}%`,
                bgcolor: 'primary.main',
                borderRadius: 1,
              }}
            />
          </Box>
        </li>
      ))}
    </Stack>
  )
}

export function MonthlyChart({ values, year }: { values: number[]; year: number }) {
  const max = Math.max(...values, 1)
  return (
    <Box
      role="list"
      aria-label={`Livros lidos por mês em ${year}`}
      sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, minmax(0, 1fr))', gap: '2px' }}
    >
      {values.map((value, index) => (
        <Tooltip key={MONTHS[index]} title={`${MONTHS[index]}/${year}: ${booksLabel(value)}`} enterTouchDelay={0}>
          <Box role="listitem" tabIndex={0} aria-label={`${MONTHS[index]}: ${booksLabel(value)}`} sx={{ textAlign: 'center' }}>
            <Box
              sx={{
                height: CHART_HEIGHT,
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                borderBottom: 1,
                borderColor: 'divider',
              }}
            >
              <Box
                sx={{
                  width: 'min(100%, 28px)',
                  height: `${(value / max) * 100}%`,
                  bgcolor: 'primary.main',
                  borderRadius: '4px 4px 0 0',
                }}
              />
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6875rem' }}>
              {MONTHS[index]}
            </Typography>
          </Box>
        </Tooltip>
      ))}
    </Box>
  )
}
