import Add from '@mui/icons-material/Add'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import LinearProgress from '@mui/material/LinearProgress'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { Link as RouterLink } from 'react-router'
import { ApiError } from '../api/client'
import { deleteReadingGoal, getMetrics, setReadingGoal } from '../api/metrics'
import { READING_STATUSES, READING_STATUS_LABELS, type Metrics } from '../api/types'
import { EmptyState } from '../components/feedback/EmptyState'
import { LoadingState } from '../components/feedback/LoadingState'
import { BarList, MonthlyChart } from '../components/metrics/charts'

const GOAL_MAX = 1000

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h2" component="h2" sx={{ mb: 2 }}>{title}</Typography>
        {children}
      </CardContent>
    </Card>
  )
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardContent>
        <Typography variant="body2" color="text.secondary">{label}</Typography>
        <Typography component="p" sx={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1.3 }}>{value}</Typography>
      </CardContent>
    </Card>
  )
}

function GoalForm({ metrics, onSaved }: { metrics: Metrics; onSaved: () => void }) {
  const [target, setTarget] = useState(metrics.goalTarget === null ? '' : String(metrics.goalTarget))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const value = Number(target)
    if (target !== '' && (!Number.isInteger(value) || value < 1 || value > GOAL_MAX)) {
      setError(`Informe um número inteiro de 1 a ${GOAL_MAX}, ou deixe vazio para remover a meta`)
      return
    }
    setSaving(true)
    setError('')
    try {
      if (target === '') await deleteReadingGoal(metrics.year)
      else await setReadingGoal(metrics.year, value)
      onSaved()
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Não foi possível salvar a meta')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Stack component="form" noValidate onSubmit={handleSubmit} direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
      <TextField
        label="Meta de livros"
        type="number"
        size="small"
        value={target}
        error={Boolean(error)}
        helperText={error || 'Deixe vazio para remover a meta.'}
        onChange={(event) => setTarget(event.target.value)}
        slotProps={{ htmlInput: { min: 1, max: GOAL_MAX } }}
      />
      <Button type="submit" variant="outlined" loading={saving}>Salvar</Button>
    </Stack>
  )
}

function GoalPanel({ metrics, onSaved }: { metrics: Metrics; onSaved: () => void }) {
  const { goalTarget: target, readInYear: read, year } = metrics
  return (
    <Panel title={`Meta de ${year}`}>
      {target !== null && (
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ mb: 1 }}>
            {read} de {target} {target === 1 ? 'livro' : 'livros'} ({Math.round((read / target) * 100)}%)
          </Typography>
          <LinearProgress
            variant="determinate"
            value={Math.min((read / target) * 100, 100)}
            aria-label={`Progresso da meta de ${year}`}
            sx={{ height: 8, borderRadius: 1 }}
          />
        </Box>
      )}
      <GoalForm key={`${year}-${target}`} metrics={metrics} onSaved={onSaved} />
    </Panel>
  )
}

export function MetricsPage() {
  const [year, setYear] = useState<number>()
  const [currentYear] = useState(() => new Date().getFullYear())
  const [reloadKey, setReloadKey] = useState(0)
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    getMetrics(year)
      .then((result) => {
        if (cancelled) return
        setMetrics(result)
        setError('')
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof ApiError ? e.message : 'Não foi possível carregar as métricas')
      })
    return () => {
      cancelled = true
    }
  }, [year, reloadKey])

  const years = metrics
    ? [...new Set([currentYear, metrics.year, ...metrics.readByYear.map((item) => item.year)])].sort((a, b) => b - a)
    : []

  return (
    <>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 3, gap: 2 }}>
        <Typography variant="h1">Métricas</Typography>
        {metrics && metrics.totalBooks > 0 && (
          <TextField
            select
            label="Ano"
            size="small"
            value={metrics.year}
            onChange={(event) => setYear(Number(event.target.value))}
            sx={{ width: 110, flexShrink: 0 }}
          >
            {years.map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
          </TextField>
        )}
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {!metrics && !error && <LoadingState />}

      {metrics && metrics.totalBooks === 0 && (
        <EmptyState
          message="Cadastre livros para ver suas métricas de leitura."
          action={<Button variant="contained" startIcon={<Add />} component={RouterLink} to="/books/new">Novo livro</Button>}
        />
      )}

      {metrics && metrics.totalBooks > 0 && (
        <Stack spacing={2}>
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' } }}>
            <Stat label="Total de livros" value={metrics.totalBooks} />
            <Stat label={`Lidos em ${metrics.year}`} value={metrics.readInYear} />
            <Stat label="Lendo agora" value={metrics.booksByStatus.READING} />
            <Stat
              label="Nota média"
              value={metrics.averageRate === null ? '–' : metrics.averageRate.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}
            />
          </Box>

          {metrics.readWithoutDate > 0 && (
            <Alert severity="info">
              {metrics.readWithoutDate === 1
                ? '1 livro lido está sem data de término e não entra nas contagens por ano e mês.'
                : `${metrics.readWithoutDate} livros lidos estão sem data de término e não entram nas contagens por ano e mês.`}
            </Alert>
          )}

          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1fr) minmax(0, 2fr)' } }}>
            <GoalPanel metrics={metrics} onSaved={() => setReloadKey((key) => key + 1)} />
            <Panel title={`Livros lidos por mês em ${metrics.year}`}>
              <MonthlyChart values={metrics.readByMonth} year={metrics.year} />
            </Panel>
          </Box>

          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))' } }}>
            <Panel title="Livros por status">
              <BarList
                items={READING_STATUSES.map((status) => ({
                  label: READING_STATUS_LABELS[status],
                  value: metrics.booksByStatus[status],
                }))}
              />
            </Panel>
            <Panel title="Distribuição de notas">
              {metrics.rateDistribution.length === 0
                ? <Typography color="text.secondary">Nenhum livro com nota.</Typography>
                : <BarList items={metrics.rateDistribution.map((item) => ({
                    label: item.rate === 1 ? '1 estrela' : `${item.rate} estrelas`,
                    value: item.count,
                  }))} />}
            </Panel>
            <Panel title="Livros lidos por ano">
              {metrics.readByYear.length === 0
                ? <Typography color="text.secondary">Nenhum livro lido com data de término.</Typography>
                : <BarList items={metrics.readByYear.map((item) => ({ label: String(item.year), value: item.count }))} />}
            </Panel>
            <Panel title="Autores mais lidos">
              {metrics.topAuthors.length === 0
                ? <Typography color="text.secondary">Nenhum livro lido ainda.</Typography>
                : <BarList items={metrics.topAuthors.map((item) => ({ label: item.author, value: item.count }))} />}
            </Panel>
          </Box>
        </Stack>
      )}
    </>
  )
}
