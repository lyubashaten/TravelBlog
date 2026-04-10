<template>
  <div class="post-list">
    <div class="container">
      <div class="post-list__wrap-info">
        <!-- Состояние загрузки -->
        <div v-if="loading" class="loading">
          Загрузка постов...
        </div>

        <!-- Состояние ошибки -->
        <div v-else-if="error" class="error">
          Ошибка загрузки: {{ error }}
          <button @click="fetchPosts" class="retry-btn">Попробовать снова</button>
        </div>

        <!-- Основной контент -->
        <template v-else>
          <ul class="post-list__list">
            <li v-for="post in posts" :key="post.id" class="post-list__item">
              <img :src="getImageUrl(post.photo)" :alt="post.title" class="post-list__image" @error="handleImageError">
              <div class="post-list__wrap">
                <h2 class="post-list__title">{{ post.title }}</h2>
                <p class="post-list__descr">{{ post.excerpt }}</p>
                <div class="post-list__location">
                  <span class="post-list__city">{{ post.city }},</span>
                  <span class="post-list__county">{{ post.county }}</span>
                </div>
                <router-link :to="`/posts/${post.id}`" class="post-list__link link">
                  Подробнее
                </router-link>
              </div>
            </li>
          </ul>

          <button
            v-if="hasMore"
            @click="loadMore"
            class="post-list__btn btn-dark"
            :disabled="loadingMore"
          >
            {{ loadingMore ? 'Загрузка...' : 'Показать ещё' }}
          </button>

          <router-link to="/create-post">
            <button class="post-list__btn btn-dark">Добавить мое путешествие</button>
          </router-link>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, toRefs } from 'vue'
import { usePostListStore } from '../store/usePostListStore'

const postsStore = usePostListStore()
const { posts, loading, error, hasMore, loadingMore } = toRefs(postsStore)
const { fetchPosts, loadMore, getImageUrl } = postsStore

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = 'https://via.placeholder.com/200x150?text=No+Image'
}

onMounted(() => {
  console.log('Компонент смонтирован, начинаем загрузку...')
  fetchPosts()
})
</script>

<style scoped lang="scss">
@use '../assets/scss/main.scss';
@use '../assets/scss/btn.scss';
@use '../assets/scss/link.scss';
@use '../assets/scss/post-list.scss'
</style>