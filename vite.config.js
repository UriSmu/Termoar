import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Nota: el formulario de Contacto hace POST a /api/contact.
  // Para producción necesitás un backend (o servicio) que envíe el email.
  // En desarrollo podés configurar un proxy aquí cuando tengas el endpoint.
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      },
    },
  },
})
