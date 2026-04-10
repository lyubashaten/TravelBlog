import { defineStore } from 'pinia'
import axios from 'axios'
import { PostDetailState } from '@/types/PostDetailState'

const baseURL = 'https://travelblog.skillbox.cc/api'

export const usePostDetailStore = defineStore('postDetail', {
  state: (): PostDetailState => ({
    post: null,
    loading: false,
    error: null
  }),

  actions: {
    async fetchPost(id: string) {
      this.loading = true
      this.error = null

      try {
        const response = await axios.get(`${baseURL}/posts/${id}`)
        this.post = response.data
        this.loading = false
        return this.post
      } catch (error: any) {
        this.loading = false

        if (error.response?.status === 404) {
          this.error = 'Пост не найден'
        } else if (error.response?.status === 401) {
          this.error = 'Неавторизованный доступ'
        } else {
          this.error = error.message || 'Ошибка загрузки поста'
        }

        throw error
      }
    },

    getImageUrl(photoPath: string | null) {
      if (!photoPath) return 'https://via.placeholder.com/800x600?text=No+Image'

      if (photoPath.startsWith('http')) {
        return photoPath
      }

      return `https://travelblog.skillbox.cc${photoPath}`
    },

    formatDate(dateString: string) {
      try {
        const date = new Date(dateString)

        const day = String(date.getDate()).padStart(2, '0')
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const year = date.getFullYear()

        return `${day}.${month}.${year}`
      } catch (error) {
        console.error('Ошибка форматирования даты:', error)
        return dateString
      }
    },

    clear() {
      this.post = null
      this.error = null
    }
  }
})