import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useState, type FormEvent } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router'
import { register } from '../api/auth'
import { ApiError } from '../api/client'
import { AuthLayout } from '../components/layout/AuthLayout'
import { useValidatedForm } from '../hooks/useValidatedForm'
import { LIMITS, validateRegister } from '../validation'

export function RegisterPage() {
  const navigate = useNavigate()

  const form = useValidatedForm({ email: '', password: '', confirmPassword: '' }, validateRegister)
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setFormError('')
    if (!form.validateAll()) return

    setSubmitting(true)
    try {
      await register({ email: form.values.email.trim(), password: form.values.password })
      navigate('/login', { replace: true, state: { registered: true } })
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 409) form.setServerErrors({ email: error.message })
        else {
          form.setServerErrors(error.fieldErrors)
          setFormError(error.message)
        }
      } else {
        setFormError('Não foi possível conectar à API')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout title="Criar conta">
      <Stack component="form" spacing={2.5} onSubmit={handleSubmit} noValidate>
        {formError && <Alert severity="error">{formError}</Alert>}

        <TextField label="E-mail" type="email" autoComplete="email" autoFocus
          slotProps={{ htmlInput: { maxLength: LIMITS.textMax } }} {...form.bind('email')} />
        <TextField label="Senha" type="password" autoComplete="new-password"
          slotProps={{ htmlInput: { maxLength: LIMITS.passwordMax } }}
          {...form.bind('password', `Entre ${LIMITS.passwordMin} e ${LIMITS.passwordMax} caracteres`)} />
        <TextField label="Confirme a senha" type="password" autoComplete="new-password"
          slotProps={{ htmlInput: { maxLength: LIMITS.passwordMax } }} {...form.bind('confirmPassword')} />

        <Button type="submit" variant="contained" size="large" loading={submitting}>Criar conta</Button>
        <Typography variant="body2" color="text.secondary" align="center">
          Já tem conta? <Link component={RouterLink} to="/login">Entrar</Link>
        </Typography>
      </Stack>
    </AuthLayout>
  )
}
