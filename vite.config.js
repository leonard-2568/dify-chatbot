import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    // 配置代理，解决浏览器跨域问题
    proxy: {
      '/dify-api': {
        target: 'https://api.dify.ai',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/dify-api/, '')
      }
    }
  }
})
