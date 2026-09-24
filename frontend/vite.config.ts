import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  const target = (serviceUrl: string | undefined) =>
    env.VITE_API_BASE_URL || serviceUrl

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/api/auth': {
          target: target(env.VITE_IDENTITY_API_URL),
          changeOrigin: true,
        },
        '/api/products': {
          target: target(env.VITE_CATALOG_API_URL),
          changeOrigin: true,
        },
        '/api/orders': {
          target: target(env.VITE_ORDER_API_URL),
          changeOrigin: true,
        },
        '/api/compatibility': {
          target: target(env.VITE_COMPATIBILITY_API_URL),
          changeOrigin: true,
        },
        '/api/analytics': {
          target: target(env.VITE_ANALYTICS_API_URL),
          changeOrigin: true,
        },
        '/api/inventory': {
          target: target(env.VITE_INVENTORY_API_URL),
          changeOrigin: true,
        },
      },
    },
  }
})
