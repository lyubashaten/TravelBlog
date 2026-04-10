<template>
  <div class="new-post">
    <div class="container">
      <div class="new-post__info-wrap">
        <h2 class="new-post__title">Добавление отзыва</h2>

        <!-- Общие ошибки -->
        <div v-if="commentStore.errors.general" class="error-message">
          {{ commentStore.errors.general }}
        </div>

        <form class="new-post__form" @submit.prevent="submitForm">
          <div class="new-post__wrap-input">
            <label class="new-post__label" for="heading">Ваше имя</label>
            <input v-model="commentStore.form.full_name" @input="clearFieldError('full_name')" class="new-post__input"
              :class="{ 'error': commentStore.errors.full_name }" id="heading" type="text" placeholder="Ваше имя" />
            <span class="new-post__massege" :class="{ 'error': commentStore.errors.full_name }">
              {{ commentStore.errors.full_name }}
            </span>
          </div>
          <div class="new-post__wrap-input new-post__wrap-input--position">
            <label class="new-post__label" for="comment">Отзыв</label>
            <textarea v-model="commentStore.form.comment" @input="clearFieldError('comment')" class="new-post__textarea"
              :class="{ 'error': commentStore.errors.comment }" id="comment" rows="5" cols="30" :maxlength="maxLength"
              placeholder="Добавьте текст отзыва"></textarea>
            <div class="new-post__counter">
              {{ commentStore.form.comment.length }} / {{ maxLength }}
            </div>
            <span class="new-post__massege" :class="{ 'error': commentStore.errors.comment }">
              {{ commentStore.errors.comment }}
            </span>
          </div>
          <div class="new-post__wrap-btn">
            <BackBtn @close="handleClose" />
            <button class="new-post__btn btn-dark" type="submit" :disabled="commentStore.loading">
              {{ commentStore.loading ? 'Сохранение...' : 'Сохранить' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Модальное окно успеха -->
    <SuccessPage v-if="showSuccessModal" message="Ваш отзыв успешно добавлен" @close="handleSuccessClose" />
  </div>
</template>


<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router'
import BackBtn from './BackBtn.vue';
import SuccessPage from './SuccessPage.vue';
import { useCommentStore } from '../store/useCommentStore'; 

const route = useRoute()
const router = useRouter()
const maxLength = 2000
const commentStore = useCommentStore()
const showSuccessModal = ref(false)

const postId = ref('')
onMounted(() => {
  const postIdParam = route.params.id
  postId.value = Array.isArray(postIdParam) ? postIdParam[0] : postIdParam?.toString() || ''
  commentStore.clearErrors()
})

// Очистка ошибок при вводе
const clearFieldError = (field: 'full_name' | 'comment' | 'general') => {
  if (commentStore.errors[field]) {
    commentStore.errors[field] = ''
  }
  if (commentStore.successMessage) {
    commentStore.successMessage = ''
  }
}

// Отправка формы
const submitForm = async () => {
  if (!postId.value) {
    commentStore.errors.general = 'ID поста не найден'
    return
  }

  const result = await commentStore.addComment(postId.value)

  if (result) {
    showSuccessModal.value = true
  }
}

// Обработка закрытия модального окна успеха
const handleSuccessClose = () => {
  showSuccessModal.value = false
  router.push(`/posts/${postId.value}`)
}

function handleClose() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push({ path: '/' })
  }
}
</script>
<style scoped lang="scss">
@use '../assets/scss/new-post';
@use '../assets/scss/btn';
</style>