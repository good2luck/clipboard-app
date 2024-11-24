import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/api/v1': {
        target: 'http://127.0.0.1:5001', // 本地开发代理到此地址
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/api/, ''), // 去掉 '/api' 前缀
      },
    },
  },
})
