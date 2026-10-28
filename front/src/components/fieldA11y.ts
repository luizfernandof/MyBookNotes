// Atributos de acessibilidade ligando o input à mensagem de erro renderizada por <Field>
export function fieldA11y(id: string, error?: string) {
  return {
    id,
    name: id,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? `${id}-error` : undefined,
  }
}
