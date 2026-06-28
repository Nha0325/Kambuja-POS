import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, import.meta.dirname, '')
  let proxyTarget = 'http://localhost:5000'

  try {
    proxyTarget = new URL(env.VITE_BASE_URL).origin
  } catch {
    // Keep the local Backend default when VITE_BASE_URL is missing or invalid.
  }

  return {
    plugins: [react()],
    build: {
      chunkSizeWarningLimit: 3000,
    },
    server: {
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
        },
      },
    },
  }
})
