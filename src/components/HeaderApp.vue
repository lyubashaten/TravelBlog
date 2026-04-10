<template>
  <div :class="['header', headerTitle === 'Истории ваших путешествий' ? 'header--other' : 'header--main']">
    <div class="container">
      <div class="header__links">
        <router-link to="/">
          <img class="header__logo" src="../assets/img/svg/logo.svg" alt="Логотип компании">
        </router-link>

        <router-link v-if="!authStore.isAuthenticated" to="/login">
          <button class="header__btn-auth">
            Войти
          </button>
        </router-link>

        <!-- Меню пользователя для авторизованных -->
        <div v-else class="header__user-menu" @mouseenter="isMenuOpen = true" @mouseleave="isMenuOpen = false">
          <div class="header__user-info">
            <img class="header__user-avatar" :src="authStore.getUserAvatar" alt="Аватар пользователя" />
            <span class="header__user-name">{{ authStore.getUserName || 'Пользователь' }}</span>
            <svg class="header__user-arrow" width="11" height="8" viewBox="0 0 11 8" fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <path v-if="!isMenuOpen"
                d="M4.28254 7.15334C4.68214 7.69716 5.49461 7.69716 5.89422 7.15334L9.98064 1.59214C10.4659 0.931721 9.99434 0 9.1748 0H1.00196C0.182414 0 -0.289162 0.93172 0.196118 1.59214L4.28254 7.15334Z"
                fill="currentColor" />
              <path v-else
                d="M4.28239 0.407941C4.68199 -0.135876 5.49446 -0.135876 5.89406 0.407941L9.98049 5.96914C10.4658 6.62956 9.99419 7.56128 9.17465 7.56128H1.0018C0.182261 7.56128 -0.289315 6.62956 0.195966 5.96914L4.28239 0.407941Z"
                fill="currentColor" />
            </svg>
          </div>

          <!-- Выпадающее меню -->
          <div v-if="isMenuOpen" class="header__dropdown-menu">
            <router-link to="/profile" class="header__menu-item" @click="isMenuOpen = false">
              Профиль
            </router-link>
            <button class="header__menu-item header__menu-item--logout" @click="handleLogout">
              Выйти
            </button>
          </div>
        </div>
      </div>
      <h1 class="header__title" :class="{
        'header__title--main': headerTitle === 'Там, где мир начинается с путешествий',
        'header__title--other': headerTitle === 'Истории ваших путешествий'
      }">
        {{ headerTitle }}
      </h1>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue';
import { useAuthStore } from '../store/useAuthStore';
import { useProfileStore } from '../store/useProfileStore'; 
import router from '../router/router';

const props = defineProps<{ title?: string }>()
const authStore = useAuthStore()
const profileStore = useProfileStore() 
const isMenuOpen = ref(false)

const headerTitle = computed(() => props.title ?? 'Истории ваших путешествий')

onMounted(async () => {
  if (authStore.isAuthenticated) {
    await authStore.loadUserData()
    await profileStore.loadProfile()
  }
})

watch(() => profileStore.profile, (newProfile) => {
  if (newProfile.id) {
    authStore.updateUserData({
      id: newProfile.id,
      full_name: newProfile.full_name,
      avatar: newProfile.photo as string || ''
    })
  }
}, { deep: true })

const handleLogout = async () => {
  try {
    await authStore.logout();
    isMenuOpen.value = false;
    await router.push('/');
  } catch (error) {
    console.error('Ошибка при выходе:', error);
    await router.push('/');
  }
}
</script>
<style scoped lang="scss">
@use '../assets/scss/main.scss';
@use '../assets/scss/header'
</style>