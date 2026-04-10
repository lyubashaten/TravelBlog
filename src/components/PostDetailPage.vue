<template>
  <div class="one-post">
    <div class="container">
      <!-- Состояние загрузки -->
      <div v-if="loading" class="loading">
        Загрузка поста...
      </div>
      <!-- Состояние ошибки -->
      <div v-else-if="error" class="error">
        {{ error }}
        <button @click="fetchPost" class="retry-btn">Попробовать снова</button>
      </div>

      <!-- Контент поста -->
      <div v-else-if="post" class="post-content">
        <img class="one-post__img" :src="getImageUrl(post.photo)" :alt="post.title" @error="handleImageError" />
        <div class="one-post__wrap-general">
          <div class="one-post__wrap-post">
            <h2 class="one-post__title">{{ post.title }}</h2>
            <p class="one-post__descr">{{ post.description }}</p>
          </div>

          <!-- Комментарии -->
          <div class="one-post__wrap-info" v-if="post.comments && post.comments.length > 0">
            <ul class="one-post__list">
              <li v-for="(comment, index) in post.comments" :key="index" class="one-post__item">
                <h4 class="one-post__name">{{ comment.author_name }}</h4>
                <span class="one-post__date">{{ formatDate(comment.created_at) }}</span>
                <p class="one-post__comment">{{ comment.comment }}</p>
              </li>
            </ul>
          </div>

          <!-- Если комментариев нет -->
          <div v-else class="no-comments">
            <p>Пока нет комментариев к этому посту.</p>
          </div>

          <div class="one-post__wrap-btn">
            <BackBtn />
            <router-link :to="`/posts/${postId}/comments`" class="one-post__btn btn-dark">
              Ваше впечатление об этом месте
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePostDetailStore } from '../store/usePostDetailStore'
import BackBtn from './BackBtn.vue'

const route = useRoute()
const router = useRouter()
const postDetailStore = usePostDetailStore()

const loading = ref(false)
const error = ref<string | null>(null)
const post = ref(postDetailStore.post)

const postId = computed(() => {
  const postIdParam = route.params.id
  return Array.isArray(postIdParam) ? postIdParam[0] : postIdParam?.toString()
})

const getImageUrl = (photoPath: string | null) => {
  return postDetailStore.getImageUrl(photoPath)
}

const formatDate = (dateString: string) => {
  return postDetailStore.formatDate(dateString)
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = 'https://via.placeholder.com/800x600?text=No+Image'
}

const fetchPost = async () => {
  if (!postId.value) {
    error.value = 'ID поста не указан'
    return
  }

  loading.value = true
  error.value = null

  try {
    await postDetailStore.fetchPost(postId.value)
    post.value = postDetailStore.post
  } catch (err: any) {
    error.value = err.message || 'Ошибка загрузки поста'
  } finally {
    loading.value = false
  }
}

watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      fetchPost()
    }
  },
  { immediate: true }
)

onMounted(() => {
  postDetailStore.clear()
  if (postId.value) {
    fetchPost()
  }
})

import { onBeforeUnmount } from 'vue'
onBeforeUnmount(() => {
  postDetailStore.clear()
})
</script>
<style scoped lang="scss">
@use '../assets/scss/btn';
@use '../assets/scss/one-post';
</style>