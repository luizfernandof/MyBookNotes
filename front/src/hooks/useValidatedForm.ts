import { useState, type ChangeEvent } from 'react'
import { hasErrors, type FieldErrors } from '../validation'

// Estado de formulário com validação: valida tudo no envio e, depois da primeira
// tentativa, revalida a cada alteração para o erro sumir assim que o campo for corrigido.
export function useValidatedForm<T extends object>(initial: T, validate: (values: T) => FieldErrors<T>) {
  const [values, setValues] = useState<T>(initial)
  const [errors, setErrors] = useState<FieldErrors<T>>({})
  const [submitted, setSubmitted] = useState(false)

  function setField<K extends keyof T>(field: K, value: T[K]) {
    const next = { ...values, [field]: value }
    setValues(next)
    if (submitted) setErrors(validate(next))
  }

  function validateAll() {
    setSubmitted(true)
    const result = validate(values)
    setErrors(result)
    return !hasErrors(result)
  }

  // Erros por campo devolvidos pela API (ProblemDetail.errors)
  function setServerErrors(fieldErrors: Record<string, string>) {
    setErrors(fieldErrors as FieldErrors<T>)
  }

  // Props para um <TextField> de texto: valor, onChange e mensagem de erro (ou dica)
  function bind<K extends keyof T>(field: K, hint?: string) {
    const error = errors[field]
    return {
      id: String(field),
      name: String(field),
      value: values[field] as string,
      onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setField(field, event.target.value as T[K]),
      error: Boolean(error),
      helperText: error ?? hint,
    }
  }

  return { values, setValues, errors, setField, validateAll, setServerErrors, bind }
}
