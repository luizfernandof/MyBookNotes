import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { register } from '../api/auth'
import { ApiError } from '../api/client'
import { Field } from '../components/Field'
import { fieldA11y } from '../components/fieldA11y'
import { hasErrors, LIMITS, validateRegister, type FieldErrors, type RegisterForm } from '../validation'

export function RegisterPage() {
  const navigate = useNavigate()

  const [form, setForm] = useState<RegisterForm>({ email: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState<FieldErrors<RegisterForm>>({})
  const [submitted, setSubmitted] = useState(false)
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function update(field: keyof RegisterForm, value: string) {
    const next = { ...form, [field]: value }
    setForm(next)
    if (submitted) setErrors(validateRegister(next))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitted(true)
    setFormError('')
    const validation = validateRegister(form)
    setErrors(validation)
    if (hasErrors(validation)) return

    setSubmitting(true)
    try {
      await register({ email: form.email.trim(), password: form.password })
      navigate('/login', { replace: true, state: { registered: true } })
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 409) setErrors({ email: error.message })
        else {
          setErrors(error.fieldErrors)
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
    <div className="auth-page">
      <form className="card auth-card" onSubmit={handleSubmit} noValidate>
        <h1>Criar conta</h1>
        {formError && <p className="notice error" role="alert">{formError}</p>}

        <Field id="email" label="E-mail" error={errors.email}>
          <input {...fieldA11y('email', errors.email)} type="email" autoComplete="email"
            maxLength={LIMITS.textMax} value={form.email} onChange={(e) => update('email', e.target.value)} />
        </Field>

        <Field id="password" label="Senha" error={errors.password}
          hint={`Entre ${LIMITS.passwordMin} e ${LIMITS.passwordMax} caracteres`}>
          <input {...fieldA11y('password', errors.password)} type="password" autoComplete="new-password"
            maxLength={LIMITS.passwordMax} value={form.password} onChange={(e) => update('password', e.target.value)} />
        </Field>

        <Field id="confirmPassword" label="Confirme a senha" error={errors.confirmPassword}>
          <input {...fieldA11y('confirmPassword', errors.confirmPassword)} type="password" autoComplete="new-password"
            maxLength={LIMITS.passwordMax} value={form.confirmPassword}
            onChange={(e) => update('confirmPassword', e.target.value)} />
        </Field>

        <button type="submit" className="button primary" disabled={submitting}>
          {submitting ? 'Criando…' : 'Criar conta'}
        </button>
        <p className="muted center">Já tem conta? <Link to="/login">Entrar</Link></p>
      </form>
    </div>
  )
}
