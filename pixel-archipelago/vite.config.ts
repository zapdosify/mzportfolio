import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // honour PORT when the harness assigns one, else Vite's default
    port: process.env.PORT ? Number(process.env.PORT) : undefined,
  },
})
