<template>
  <div class="new-post">
    <div class="container">
      <div class="new-post__info-wrap">
        <h2 class="new-post__title">Вход в профиль</h2>

        <!-- Общее сообщение об ошибке -->
        <span class="new-post__massege" :class="{ 'error': authStore.errors.general }" v-if="authStore.errors.general">
          {{ authStore.errors.general }}
        </span>

        <form class="new-post__form" @submit.prevent="onSubmit" method="post">
          <div class="new-post__wrap-input">
            <label class="new-post__label" for="email">Email</label>
            <input class="new-post__input" :class="{ 'error': authStore.errors.email }" v-model="authStore.form.email"
              id="email" type="email" placeholder="Email" @input="clearFieldError('email')" />
            <span class="new-post__massege" :class="{ 'error': authStore.errors.email }" v-if="authStore.errors.email">
              {{ authStore.errors.email }}
            </span>
          </div>

          <div class="new-post__wrap-input">
            <label class="new-post__label" for="password">Пароль</label>
            <input class="new-post__input" :class="{ 'error': authStore.errors.password }"
              v-model="authStore.form.password" id="password" type="password" placeholder="Пароль"
              @input="clearFieldError('password')" />
            <span class="new-post__massege" :class="{ 'error': authStore.errors.password }"
              v-if="authStore.errors.password">
              {{ authStore.errors.password }}
            </span>
          </div>

          <div class="new-post__wrap-btn">
            <router-link to="/register">
              <button class="new-post__btn btn-light" type="button">Зарегистрироваться</button>
            </router-link>
            <button class="new-post__btn btn-dark" type="submit" :disabled="authStore.loading">
              {{ authStore.loading ? 'Вход...' : 'Войти' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '../store/useAuthStore'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const clearFieldError = (field: keyof typeof authStore.errors) => {
  if (authStore.errors[field]) {
    authStore.errors[field] = ''
  }
  if (authStore.errors.general) {
    authStore.errors.general = ''
  }
}

const onSubmit = async () => {
  const success = await authStore.login()

  if (success) {
    router.push('/profile')
  }
}
</script>
<style scoped lang="scss">
@use '../assets/scss/new-post';
@use '../assets/scss/btn';
</style>