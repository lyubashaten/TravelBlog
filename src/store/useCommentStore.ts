import { defineStore } from 'pinia'
import axios from 'axios'
import { CommentForm } from '@/types/CommentForm'
import { CommentErrors } from '@/types/CommentErrors'

type ServerErrors = Record<string, string | string[]>

const baseURL = 'https://travelblog.skillbox.cc/api'

export const useCommentStore = defineStore('comment', {
  state: () => ({
    form: {
      full_name: '',
      comment: ''
    } as CommentForm,
    errors: {} as CommentErrors,
    loading: false,
    successMessage: ''
  }),

  actions: {
    async addComment(postId: string) {
      this.errors = {}
      this.loading = true
      this.successMessage = ''

      if (!this.form.full_name.trim()) {
        this.errors.full_name = 'Напишите имя'
        this.loading = false
        return false
      }

      if (!this.form.comment.trim()) {
        this.errors.comment = 'Введите текст отзыва'
        this.loading = false
        return false
      }

      if (this.form.comment.length > 2000) {
        this.errors.comment = 'Отзыв не должен превышать 2000 символов'
        this.loading = false
        return false
      }

      try {
        const token = localStorage.getItem('authToken')

        const response = await axios.post(
          `${baseURL}/posts/${postId}/comments`,
          {
            full_name: this.form.full_name,
            comment: this.form.comment
          },
          {
            headers: {
              'Authorization': token ? `Bearer ${token}` : '',
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          }
        )

        this.successMessage = 'Комментарий успешно добавлен'
        this.loading = false

        // Очищаем форму после успешной отправки
        this.form.full_name = ''
        this.form.comment = ''

        return response.data
      } catch (error: any) {
        this.loading = false

        if (error.response?.data?.errors) {
          const serverErrors: ServerErrors = error.response.data.errors

          const errorKeys: Array<keyof CommentErrors> = ['full_name', 'comment', 'general']

          for (const key in serverErrors) {
            if (errorKeys.includes(key as keyof CommentErrors)) {
              const errorKey = key as keyof CommentErrors
              const errorValue = serverErrors[key]

              this.errors[errorKey] = Array.isArray(errorValue)
                ? errorValue[0]
                : errorValue
            }
          }
        } else if (error.response?.status === 400) {
          this.errors.general = 'Пост не найден или данные некорректны'
        } else if (error.response?.status === 404) {
          this.errors.general = 'Пост не найден'
        } else {
          this.errors.general = 'Ошибка при добавлении комментария'
        }

        return false
      }
    },

    clearErrors() {
      this.errors = {}
      this.successMessage = ''
    },

    clearForm() {
      this.form.full_name = ''
      this.form.comment = ''
    }
  }
})