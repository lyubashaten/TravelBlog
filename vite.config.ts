import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/TravelBlog/',
  server: {
    port: 3000, 
    proxy: {
      '/api': {
        target: 'http://travelblog.skillbox.cc',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})