# MyBookNotes — front

React + Vite + TypeScript para a API em `../api`.

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
