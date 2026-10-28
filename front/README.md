# MyBookNotes — front

React + Vite + TypeScript + [MUI](https://mui.com) para a API em `../api`.

## Estrutura

```
src/
  api/          chamadas à API, tipos e cliente HTTP com refresh automático
  auth/         contexto de autenticação
  theme/        tema MUI (identidade visual, claro/escuro) e botão de troca de tema
  hooks/        useValidatedForm: estado + validação dos formulários
  components/
    layout/     AppBar, moldura das telas de login/cadastro, marca
    books/      card, capa e chip de status do livro
    feedback/   carregando, estado vazio, diálogo de confirmação
  pages/        uma página por rota
  validation.ts regras de validação (espelho dos DTOs da API)
```

## Tema

As cores ficam em `src/theme/theme.ts`, em versões clara e escura. O botão de tema (na barra superior e nas telas
de login/cadastro) alterna entre Claro, Escuro e Sistema; a escolha fica salva no navegador.

## Rodando

```bash
# terminal 1 — API (porta 8080)
cd ../api
export JWT_SECRET=$(openssl rand -base64 48)
./mvnw spring-boot:run

# terminal 2 — front (porta 5173)
npm install
npm run dev
```

Abra http://localhost:5173. O Vite encaminha `/api` para `localhost:8080` (veja `vite.config.ts`),
então não é preciso configurar CORS.

## Autenticação

- O access token fica só em memória (`src/api/client.ts`); o refresh token fica num cookie HttpOnly gerenciado pela API.
- Ao receber 401, o cliente renova o token uma vez e repete a requisição.
- Renovações concorrentes são serializadas (na aba e entre abas, via Web Locks), porque o refresh token é de uso único.

## Validações

`src/validation.ts` espelha as anotações dos DTOs da API. Ao alterar uma regra no backend, atualize esse arquivo.
Erros devolvidos pela API também são exibidos nos campos.
