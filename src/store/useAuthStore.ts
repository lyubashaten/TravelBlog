import { defineStore } from 'pinia'
import axios from 'axios'
import { LoginForm } from '@/types/LoginForm'
import { AuthErrors } from '@/types/AuthErrors'


const baseURL = 'https://travelblog.skillbox.cc/api'

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

export const useAuthStore = defineStore('auth', {
  state: () => ({
    form: {
      email: '',
      password: ''
    } as LoginForm,
    errors: {} as AuthErrors,
    token: localStorage.getItem('authToken') || '',
    loading: false,
    user: {
      id: null as number | null,
      full_name: '',
      avatar: ''
    }
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    getUserName: (state) => state.user.full_name,
    getUserAvatar: (state) => {
      if (state.user.id) {
        const savedPhoto = localStorage.getItem(`user_photo_${state.user.id}`)
        if (savedPhoto) {
          return savedPhoto
        }
      }

      if (state.user.avatar) {
        return state.user.avatar
      }

      const name = state.user.full_name || 'Пользователь'
      return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name.trim())}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&size=100`
    }
  },

  actions: {
    async login() {
      this.errors = {}
      this.loading = true

      if (!this.form.email) {
        this.errors.email = 'Email обязателен'
        this.loading = false
        return false
      }

      if (!this.form.password) {
        this.errors.password = 'Пароль обязателен'
        this.loading = false
        return false
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(this.form.email)) {
        this.errors.email = 'Пожалуйста, введите корректный email'
        this.loading = false
        return false
      }

      try {
        const response = await api.post('/login', {
          email: this.form.email,
          password: this.form.password,
        })

        this.token = response.data.token || ''

        if (this.token) {
          localStorage.setItem('authToken', this.token)
          api.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
          await this.loadUserData()
        }

        this.loading = false

        this.form.email = ''
        this.form.password = ''
        this.errors = {}

        return true

      } catch (error: unknown) {
        this.loading = false
        console.error('Ошибка входа:', error)

        if (axios.isAxiosError(error) && error.response) {
          const { status, data } = error.response

          switch (status) {
            case 400:
              if (data.errors) {
                for (const key in data.errors) {
                  if (Array.isArray(data.errors[key]) && data.errors[key].length > 0) {
                    this.errors[key as keyof AuthErrors] = data.errors[key][0]
                  }
                }
              } else if (data.message) {
                this.errors.general = data.message
              } else {
                this.errors.general = 'Неправильный email или пароль'
              }
              break
            case 422:
              if (data.errors) {
                for (const key in data.errors) {
                  if (Array.isArray(data.errors[key]) && data.errors[key].length > 0) {
                    this.errors[key as keyof AuthErrors] = data.errors[key][0]
                  }
                }
              }
              break
            case 401:
              this.errors.general = 'Неверные учетные данные'
              break
            case 500:
              this.errors.general = 'Внутренняя ошибка сервера'
              break
            default:
              this.errors.general = data.message || `Ошибка входа (код: ${status})`
          }
        } else if (error instanceof Error) {
          if (error.message.includes('Network Error')) {
            this.errors.general = 'Ошибка сети. Проверьте подключение к интернету.'
          } else if (error.message.includes('timeout')) {
            this.errors.general = 'Превышено время ожидания ответа от сервера'
          } else {
            this.errors.general = 'Произошла неизвестная ошибка'
          }
        } else {
          this.errors.general = 'Произошла неизвестная ошибка'
        }

        return false
      }
    },

    async loadUserData() {
      try {
        const token = localStorage.getItem('authToken')
        if (!token) return

        const response = await api.get('/user', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        })

        if (response.data) {
          this.user = {
            id: response.data.id,
            full_name: response.data.full_name || '',
            avatar: ''
          }

          if (response.data.id) {
            const savedPhoto = localStorage.getItem(`user_photo_${response.data.id}`)
            if (savedPhoto) {
              this.user.avatar = savedPhoto
            }
          }
        }
      } catch (error) {
        console.error('Ошибка загрузки данных пользователя:', error)
      }
    },

    async logout() {
      try {
        const token = localStorage.getItem('authToken')
        if (token) {
          await api.get('/logout', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            }
          })
        }
      } catch (error) {
        console.error('Ошибка при выходе:', error)
      } finally {
        this.token = ''
        this.user = {
          id: null,
          full_name: '',
          avatar: ''
        }
        this.form.email = ''
        this.form.password = ''
        this.errors = {}
        localStorage.removeItem('authToken')
        delete api.defaults.headers.common['Authorization']
      }
    },

    updateUserAvatar(avatarUrl: string) {
      this.user.avatar = avatarUrl
    },

    updateUserData(userData: { id: number; full_name: string; avatar?: string }) {
      this.user.id = userData.id
      this.user.full_name = userData.full_name
      if (userData.avatar) {
        this.user.avatar = userData.avatar
      }
    },

    clearErrors() {
      this.errors = {}
    }
  }
})