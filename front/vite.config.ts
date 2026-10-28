import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Encaminha /api para o Spring: o navegador vê front e API na mesma origem,
    // então não é preciso CORS e o cookie SameSite=Strict do refresh token funciona
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
})
