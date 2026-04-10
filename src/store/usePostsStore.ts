import { defineStore } from 'pinia'
import axios from 'axios'

export interface Post {
  id?: number
  title: string
  description: string
  country: string
  city: string
  photo?: File | null
}

interface PostsState {
  form: Post
  loading: boolean
  errors: Record<string, string>
}

const baseURL = 'https://travelblog.skillbox.cc/api'

export const usePostsStore = defineStore('posts', {
  state: (): PostsState => ({
    form: {
      title: '',
      description: '',
      country: '',
      city: '',
      photo: null
    },
    loading: false,
    errors: {}
  }),

  actions: {
    async createPost() {
      this.errors = {}
      this.loading = true

      if (!this.form.title.trim()) {
        this.errors.title = 'Заголовок обязателен'
        this.loading = false
        return null
      }

      if (!this.form.description.trim()) {
        this.errors.description = 'Описание обязательно'
        this.loading = false
        return null
      }

      if (!this.form.country.trim()) {
        this.errors.country = 'Страна обязательна'
        this.loading = false
        return null
      }

      if (!this.form.city.trim()) {
        this.errors.city = 'Город обязателен'
        this.loading = false
        return null
      }

      if (!this.form.photo) {
        this.errors.photo = 'Фото обязательно'
        this.loading = false
        return null
      }

      try {
        const token = localStorage.getItem('authToken')
        const formData = new FormData()

        formData.append('title', this.form.title)
        formData.append('description', this.form.description)
        formData.append('country', this.form.country)
        formData.append('city', this.form.city)

        if (this.form.photo) {
          formData.append('photo', this.form.photo)
        }

        const response = await axios.post(`${baseURL}/posts`, formData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
            'Accept': 'application/json'
          }
        })

        this.loading = false

        this.clearForm()

        return response.data
      } catch (error: any) {
        this.loading = false
        console.error('Ошибка создания поста:', error)

        if (error.response?.data?.errors) {
          this.errors = error.response.data.errors
        } else if (error.response?.status === 401) {
          this.errors.general = 'Неавторизованный доступ'
        } else if (error.response?.status === 422) {
          this.errors.general = 'Ошибка валидации данных'
        } else {
          this.errors.general = 'Ошибка при создании поста'
        }

        return null
      }
    },

    clearForm() {
      this.form = {
        title: '',
        country: '',
        city: '',
        description: '',
        photo: null
      }
    },

    clearErrors() {
      this.errors = {}
    },

    setPhoto(file: File) {
      this.form.photo = file
    },
  }
})