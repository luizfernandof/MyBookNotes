import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { ApiError } from '../api/client'
import { useAuth } from '../auth/context'
import { Field } from '../components/Field'
import { fieldA11y } from '../components/fieldA11y'
import { hasErrors, LIMITS, validateLogin, type FieldErrors, type LoginForm } from '../validation'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const justRegistered = (location.state as { registered?: boolean } | null)?.registered

  const [form, setForm] = useState<LoginForm>({ email: '', password: '' })
  const [errors, setErrors] = useState<FieldErrors<LoginForm>>({})
  const [submitted, setSubmitted] = useState(false)
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function update(field: keyof LoginForm, value: string) {
    const next = { ...form, [field]: value }
    setForm(next)
    if (submitted) setErrors(validateLogin(next))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitted(true)
    setFormError('')
    const validation = validateLogin(form)
    setErrors(validation)
    if (hasErrors(validation)) return

    setSubmitting(true)
    try {
      await login({ email: form.email.trim(), password: form.password })
      navigate('/books', { replace: true })
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors(error.fieldErrors)
        setFormError(error.message)
      } else {
        setFormError('Não foi possível conectar à API')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <form className="card auth-card" onSubmit={handleSubmit} noValidate>
        <h1>Entrar</h1>
        {justRegistered && <p className="notice success">Conta criada! Agora é só entrar.</p>}
        {formError && <p className="notice error" role="alert">{formError}</p>}

        <Field id="email" label="E-mail" error={errors.email}>
          <input {...fieldA11y('email', errors.email)} type="email" autoComplete="email"
            maxLength={LIMITS.textMax} value={form.email} onChange={(e) => update('email', e.target.value)} />
        </Field>

        <Field id="password" label="Senha" error={errors.password}>
          <input {...fieldA11y('password', errors.password)} type="password" autoComplete="current-password"
            value={form.password} onChange={(e) => update('password', e.target.value)} />
        </Field>

        <button type="submit" className="button primary" disabled={submitting}>
          {submitting ? 'Entrando…' : 'Entrar'}
        </button>
        <p className="muted center">Não tem conta? <Link to="/register">Cadastre-se</Link></p>
      </form>
    </div>
  )
}
