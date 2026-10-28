import { READING_STATUSES, type BookRequest, type ReadingStatus } from './api/types'

// Regras espelhando as anotações de validação dos DTOs da API:
//   RegisterRequestDTO: email @NotBlank @Email @Size(max=255), password @NotBlank @Size(min=8, max=72)
//   LoginRequestDTO:    email @NotBlank, password @NotBlank
//   BookRequestDTO:     title/author @NotBlank @Size(max=255), rate @Min(0) @Max(5),
//                       coverUrl @Size(max=255), status @NotNull
// Ao mudar uma regra no backend, atualize aqui também. A API continua sendo a autoridade:
// os erros que ela devolver também são mostrados nos campos.
export const LIMITS = {
  textMax: 255,
  passwordMin: 8,
  passwordMax: 72,
  rateMin: 0,
  rateMax: 5,
} as const

export type FieldErrors<T> = Partial<Record<keyof T, string>>

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function isBlank(value: string) {
  return value.trim() === ''
}

export function hasErrors<T>(errors: FieldErrors<T>) {
  return Object.keys(errors).length > 0
}

export interface RegisterForm {
  email: string
  password: string
  confirmPassword: string
}

export function validateRegister(form: RegisterForm): FieldErrors<RegisterForm> {
  const errors: FieldErrors<RegisterForm> = {}

  if (isBlank(form.email)) errors.email = 'Informe o e-mail'
  else if (form.email.trim().length > LIMITS.textMax) errors.email = `Use no máximo ${LIMITS.textMax} caracteres`
  else if (!EMAIL_PATTERN.test(form.email.trim())) errors.email = 'E-mail inválido'

  if (isBlank(form.password)) errors.password = 'Informe a senha'
  else if (form.password.length < LIMITS.passwordMin || form.password.length > LIMITS.passwordMax)
    errors.password = `A senha deve ter entre ${LIMITS.passwordMin} e ${LIMITS.passwordMax} caracteres`

  if (form.confirmPassword !== form.password) errors.confirmPassword = 'As senhas não conferem'

  return errors
}

export interface LoginForm {
  email: string
  password: string
}

export function validateLogin(form: LoginForm): FieldErrors<LoginForm> {
  const errors: FieldErrors<LoginForm> = {}
  if (isBlank(form.email)) errors.email = 'Informe o e-mail'
  if (isBlank(form.password)) errors.password = 'Informe a senha'
  return errors
}

// Valores do formulário de livro como o usuário digita (tudo string)
export interface BookForm {
  title: string
  author: string
  rate: string
  summary: string
  finishedAt: string
  coverUrl: string
  status: ReadingStatus | ''
}

export function validateBook(form: BookForm): FieldErrors<BookForm> {
  const errors: FieldErrors<BookForm> = {}

  if (isBlank(form.title)) errors.title = 'Informe o título'
  else if (form.title.trim().length > LIMITS.textMax) errors.title = `Use no máximo ${LIMITS.textMax} caracteres`

  if (isBlank(form.author)) errors.author = 'Informe o autor'
  else if (form.author.trim().length > LIMITS.textMax) errors.author = `Use no máximo ${LIMITS.textMax} caracteres`

  if (form.rate !== '') {
    const rate = Number(form.rate)
    if (!Number.isInteger(rate) || rate < LIMITS.rateMin || rate > LIMITS.rateMax)
      errors.rate = `A nota deve ser um número inteiro de ${LIMITS.rateMin} a ${LIMITS.rateMax}`
  }

  if (form.coverUrl.trim().length > LIMITS.textMax) errors.coverUrl = `Use no máximo ${LIMITS.textMax} caracteres`

  if (form.finishedAt !== '' && Number.isNaN(Date.parse(form.finishedAt))) errors.finishedAt = 'Data inválida'

  if (form.status === '' || !READING_STATUSES.includes(form.status)) errors.status = 'Selecione o status'

  return errors
}

export function toBookRequest(form: BookForm): BookRequest {
  const optional = (value: string) => (value.trim() === '' ? null : value.trim())
  return {
    title: form.title.trim(),
    author: form.author.trim(),
    rate: form.rate === '' ? null : Number(form.rate),
    summary: optional(form.summary),
    finishedAt: optional(form.finishedAt),
    coverUrl: optional(form.coverUrl),
    status: form.status as ReadingStatus,
  }
}
