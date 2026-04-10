import { defineStore } from 'pinia'
import axios from 'axios'
import { useAuthStore } from './useAuthStore'

interface RegisterForm {
  email: string
  password: string
  confirmPassword: string
}

interface RegisterErrors {
  email?: string
  password?: string
  passwordMatch?: string
  [key: string]: string | undefined
}

const baseURL = 'https://travelblog.skillbox.cc/api'

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

export const useRegisterStore = defineStore('register', {
  state: () => ({
    form: {
      email: '',
      password: '',
      confirmPassword: ''
    } as RegisterForm,
    errors: {} as RegisterErrors,
    token: '',
    loading: false
  }),

  actions: {
    async register() {
      this.errors = {}

      if (!this.form.email) {
        this.errors.email = 'Email обязателен'
        return false
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(this.form.email)) {
        this.errors.email = 'Пожалуйста, введите корректный email формата username@hostname.domain'
        return false
      }

      if (this.form.password !== this.form.confirmPassword) {
        this.errors.passwordMatch = 'Пароли не совпадают'
        return false
      }

      if (this.form.password.length < 6) {
        this.errors.password = 'Пароль должен содержать минимум 6 символов'
        return false
      }

      this.loading = true

      try {
        console.log('Отправка запроса на:', baseURL + '/register')

        const response = await api.post('/register', {
          email: this.form.email,
          password: this.form.password,
        })

        console.log('Ответ сервера:', response.data)

        this.token = response.data.token || response.data.access_token || ''

        this.loading = false

        this.form.email = ''
        this.form.password = ''
        this.form.confirmPassword = ''
        this.errors = {}

        if (this.token) {
          localStorage.setItem('authToken', this.token)

          const authStore = useAuthStore()
          await authStore.loadUserData()
        }

        return true

      } catch (error: unknown) {
        this.loading = false

        if (axios.isAxiosError(error) && error.response) {
          const { status, data } = error.response

          switch (status) {
            case 422:
              if (data.errors) {
                for (const key in data.errors) {
                  if (Array.isArray(data.errors[key]) && data.errors[key].length > 0) {
                    this.errors[key] = data.errors[key][0]
                  }
                }
              }
              break
            case 409:
              this.errors.email = 'Аккаунт с данным email уже существует'
              break
            case 405:
              this.errors.email = 'Метод не разрешен. Пожалуйста, проверьте настройки сервера.'
              break
            default:
              this.errors.email = data.message || `Ошибка регистрации (код: ${status})`
          }
        } else if (error instanceof Error) {
          if (error.message.includes('Network Error')) {
            this.errors.email = 'Ошибка сети. Проверьте подключение к интернету.'
          } else if (error.message.includes('timeout')) {
            this.errors.email = 'Превышено время ожидания ответа от сервера'
          } else {
            this.errors.email = 'Произошла неизвестная ошибка'
          }
        } else {
          this.errors.email = 'Произошла неизвестная ошибка'
        }

        console.error('Ошибка регистрации:', error)
        return false
      }
    },

    clearErrors() {
      this.errors = {}
    }
  }
})