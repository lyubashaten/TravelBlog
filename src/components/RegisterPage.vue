<template>
  <div class="new-post">
    <div class="container">
      <div class="new-post__info-wrap">
        <h2 class="new-post__title">Регистрация</h2>
        <form class="new-post__form" @submit.prevent="onSubmit" action="" method="post">
          <div class="new-post__wrap-input">
            <label class="new-post__label" for="email">Email</label>
            <input class="new-post__input" :class="{ 'error': registerStore.errors.email }"
              v-model="registerStore.form.email" id="email" type="email" placeholder="Email" @blur="validateEmail" />
            <span class="new-post__massege" :class="{ 'error': registerStore.errors.email }">
              {{ registerStore.errors.email }}
            </span>
          </div>
          <div class="new-post__wrap-info">
            <div class="new-post__wrap-input">
              <label class="new-post__label" for="password">Пароль</label>
              <input class="new-post__input new-post__input--size" :class="{ 'error': registerStore.errors.password }"
                v-model="registerStore.form.password" id="password" type="password" placeholder="Пароль"
                @input="validatePasswords" />
              <span class="new-post__massege" :class="{ 'error': registerStore.errors.password }">
                {{ registerStore.errors.password }}
              </span>
            </div>
            <div class="new-post__wrap-input">
              <label class="new-post__label" for="confirmPassword">Повторите пароль</label>
              <input class="new-post__input new-post__input--size"
                :class="{ 'error': registerStore.errors.passwordMatch }" v-model="registerStore.form.confirmPassword"
                id="confirmPassword" type="password" placeholder="Повторите пароль" @input="validatePasswords" />
              <span class="new-post__massege" :class="{ 'error': registerStore.errors.passwordMatch }">
                {{ registerStore.errors.passwordMatch }}
              </span>
            </div>
          </div>
          <div class="new-post__wrap-btn">
            <button class="new-post__btn btn-light" type="submit" :disabled="registerStore.loading">
              {{ registerStore.loading ? 'Регистрация...' : 'Зарегистрироваться' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRegisterStore } from '../store/useRegisterStore'
import { useRouter } from 'vue-router'

const registerStore = useRegisterStore()
const router = useRouter()

// Валидация email
const validateEmail = () => {
  const email = registerStore.form.email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!email) {
    registerStore.errors.email = 'Пожалуйста, введите ваш email'
  } else if (!emailRegex.test(email)) {
    registerStore.errors.email = 'Пожалуйста, введите корректный email формата username@hostname.domain'
  } else {
    registerStore.errors.email = ''
  }
}

// Валидация паролей
const validatePasswords = () => {
  const { password, confirmPassword } = registerStore.form

  if (password && confirmPassword && password !== confirmPassword) {
    registerStore.errors.passwordMatch = 'Пароли не совпадают'
  }
  else {
    registerStore.errors.passwordMatch = ''
  }

  // Дополнительная валидация пароля
  if (password && password.length < 6) {
    registerStore.errors.password = 'Пароль должен содержать минимум 6 символов'
  } else {
    registerStore.errors.password = ''
  }
}

const onSubmit = async () => {
  validateEmail()
  validatePasswords()

  const hasErrors = Object.values(registerStore.errors).some(error => error && error !== '')
  if (hasErrors) {
    return
  }

  try {
    const success = await registerStore.register()
    if (success) {
      router.push('/login')
    }
  } catch (error) {
    console.error('Registration error:', error)
    registerStore.errors.general = 'Произошла ошибка при регистрации. Пожалуйста, попробуйте снова.'
  }
}
</script>
<style scoped lang="scss">
@use '../assets/scss/new-post';
@use '../assets/scss/btn';
</style>