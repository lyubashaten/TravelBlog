import { defineStore } from 'pinia'
import axios from 'axios'
import { PasswordForm } from '@/types/PasswordForm'
import { PasswordErrors } from '@/types/PasswordErrors'

const baseURL = 'https://travelblog.skillbox.cc/api'

export const usePasswordStore = defineStore('password', {
  state: () => ({
    form: {
      password: '',
      password_confirmation: ''
    } as PasswordForm,
    errors: {} as PasswordErrors,
    loading: false,
    successMessage: ''
  }),

  getters: {
    passwordsMatch: (state) => state.form.password === state.form.password_confirmation
  },

  actions: {
    async changePassword() {
      this.errors = {}
      this.successMessage = ''
      this.loading = true

      if (!this.form.password.trim()) {
        this.errors.password = 'Введите новый пароль'
        this.loading = false
        return false
      }

      if (!this.form.password_confirmation.trim()) {
        this.errors.password_confirmation = 'Повторите новый пароль'
        this.loading = false
        return false
      }

      if (this.form.password.length < 6) {
        this.errors.password = 'Пароль должен содержать минимум 6 символов'
        this.loading = false
        return false
      }

      if (!this.passwordsMatch) {
        this.errors.password_confirmation = 'Пароли не совпадают'
        this.loading = false
        return false
      }

      try {
        const token = localStorage.getItem('authToken')

        console.log('Отправка запроса на смену пароля')

        const response = await axios.patch(`${baseURL}/user/password`, {
          password: this.form.password
        }, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        })

        console.log('Пароль успешно изменен:', response.data)

        this.successMessage = response.data.message || 'Пароль успешно изменен'
        this.loading = false

        // Очищаем форму после успешной смены пароля
        this.form.password = ''
        this.form.password_confirmation = ''

        return true
      } catch (error: any) {
        this.loading = false
        console.error('Ошибка при смене пароля:', error)

        if (error.response?.data?.errors) {
          if (error.response.data.errors.password) {
            this.errors.password = Array.isArray(error.response.data.errors.password)
              ? error.response.data.errors.password[0]
              : error.response.data.errors.password
          } else {
            this.errors.general = 'Ошибка валидации пароля'
          }
        } else if (error.response?.status === 400) {
          this.errors.password = 'Неверные данные для смены пароля'
        } else if (error.response?.status === 401) {
          this.errors.general = 'Неавторизованный доступ. Войдите снова.'
        } else if (error.response?.status === 422) {
          this.errors.general = 'Ошибка валидации данных'
        } else {
          this.errors.general = 'Ошибка при смене пароля. Попробуйте позже.'
        }

        return false
      }
    },

    clearErrors() {
      this.errors = {}
      this.successMessage = ''
    },

    // Метод для проверки совпадения паролей
    validatePasswords() {
      if (this.form.password_confirmation && !this.passwordsMatch) {
        this.errors.password_confirmation = 'Пароли не совпадают'
      } else {
        this.errors.password_confirmation = ''
      }
    }
  }
})