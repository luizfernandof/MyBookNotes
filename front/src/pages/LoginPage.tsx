import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useState, type FormEvent } from 'react'
import { Link as RouterLink, useLocation, useNavigate } from 'react-router'
import { ApiError } from '../api/client'
import { useAuth } from '../auth/context'
import { AuthLayout } from '../components/layout/AuthLayout'
import { useValidatedForm } from '../hooks/useValidatedForm'
import { LIMITS, validateLogin } from '../validation'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const justRegistered = (location.state as { registered?: boolean } | null)?.registered

  const form = useValidatedForm({ email: '', password: '' }, validateLogin)
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setFormError('')
    if (!form.validateAll()) return

    setSubmitting(true)
    try {
      await login({ email: form.values.email.trim(), password: form.values.password })
      navigate('/books', { replace: true })
    } catch (error) {
      if (error instanceof ApiError) {
        form.setServerErrors(error.fieldErrors)
        setFormError(error.message)
      } else {
        setFormError('Não foi possível conectar à API')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout title="Entrar">
      <Stack component="form" spacing={2.5} onSubmit={handleSubmit} noValidate>
        {justRegistered && <Alert severity="success">Conta criada! Agora é só entrar.</Alert>}
        {formError && <Alert severity="error">{formError}</Alert>}

        <TextField label="E-mail" type="email" autoComplete="email" autoFocus
          slotProps={{ htmlInput: { maxLength: LIMITS.textMax } }} {...form.bind('email')} />
        <TextField label="Senha" type="password" autoComplete="current-password" {...form.bind('password')} />

        <Button type="submit" variant="contained" size="large" loading={submitting}>Entrar</Button>
        <Typography variant="body2" color="text.secondary" align="center">
          Não tem conta? <Link component={RouterLink} to="/register">Cadastre-se</Link>
        </Typography>
      </Stack>
    </AuthLayout>
  )
}
