<template>
  <div v-if="isOpen" class="new-post">
    <div class="container">
      <div class="new-post__info-wrap">
        <h2 class="new-post__title">Добавление истории о путешествии</h2>

        <!-- Общее сообщение об ошибке -->
        <div v-if="postsStore.errors.general" class="error-message">
          {{ postsStore.errors.general }}
        </div>

        <form class="new-post__form" @submit.prevent="onSubmit" method="post">
          <div class="new-post__wrapper-img">
            <input ref="fileInput" type="file" accept="image/*" class="new-post__input-none" @change="onFileChange"
              id="file-upload" />
            <label for="file-upload" class="new-post__false-input">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M5.24988 3.96881H6.40457V9.25475C6.40457 9.3235 6.46082 9.37975 6.52957 9.37975H7.46707C7.53582 9.37975 7.59207 9.3235 7.59207 9.25475V3.96881H8.74988C8.85457 3.96881 8.91238 3.8485 8.84832 3.76725L7.09832 1.55162C7.08662 1.53668 7.07168 1.5246 7.05463 1.51629C7.03757 1.50798 7.01885 1.50366 6.99988 1.50366C6.98091 1.50366 6.96218 1.50798 6.94513 1.51629C6.92807 1.5246 6.91313 1.53668 6.90144 1.55162L5.15144 3.76569C5.08738 3.8485 5.14519 3.96881 5.24988 3.96881ZM12.7186 8.786H11.7811C11.7124 8.786 11.6561 8.84225 11.6561 8.911V11.3172H2.34363V8.911C2.34363 8.84225 2.28738 8.786 2.21863 8.786H1.28113C1.21238 8.786 1.15613 8.84225 1.15613 8.911V12.0047C1.15613 12.2813 1.37957 12.5047 1.65613 12.5047H12.3436C12.6202 12.5047 12.8436 12.2813 12.8436 12.0047V8.911C12.8436 8.84225 12.7874 8.786 12.7186 8.786Z"
                  fill="black" fill-opacity="0.25" />
              </svg>
              <span class="new-post__label new-post__label--affter">
                {{ fileName || 'Загрузите ваше фото' }}
              </span>
            </label>
            <span class="new-post__massege" :class="{ 'error': postsStore.errors.photo }"
              v-if="postsStore.errors.photo">
              {{ postsStore.errors.photo }}
            </span>
          </div>

          <div class="new-post__wrap-input">
            <label class="new-post__label" for="heading">Заголовок</label>
            <input v-model="postsStore.form.title" @input="clearFieldError('title')" class="new-post__input"
              :class="{ 'error': postsStore.errors.title }" id="heading" type="text" placeholder="Заголовок" />
            <span class="new-post__massege" :class="{ 'error': postsStore.errors.title }"
              v-if="postsStore.errors.title">
              {{ postsStore.errors.title }}
            </span>
          </div>

          <div class="new-post__wrap-info">
            <div class="new-post__wrap-input">
              <label class="new-post__label" for="country">Страна</label>
              <input v-model="postsStore.form.country" @input="clearFieldError('country')"
                class="new-post__input new-post__input--size" :class="{ 'error': postsStore.errors.country }"
                id="country" type="text" placeholder="Страна" />
              <span class="new-post__massege" :class="{ 'error': postsStore.errors.country }"
                v-if="postsStore.errors.country">
                {{ postsStore.errors.country }}
              </span>
            </div>

            <div class="new-post__wrap-input">
              <label class="new-post__label" for="city">Город</label>
              <input v-model="postsStore.form.city" @input="clearFieldError('city')"
                class="new-post__input new-post__input--size" :class="{ 'error': postsStore.errors.city }" id="city"
                type="text" placeholder="Город" />
              <span class="new-post__massege" :class="{ 'error': postsStore.errors.city }"
                v-if="postsStore.errors.city">
                {{ postsStore.errors.city }}
              </span>
            </div>
          </div>

          <div class="new-post__wrap-input new-post__wrap-input--position">
            <label class="new-post__label" for="comment">Описание</label>
            <textarea v-model="postsStore.form.description" @input="clearFieldError('description')"
              class="new-post__textarea" :class="{ 'error': postsStore.errors.description }" id="comment" rows="5"
              cols="30" :maxlength="maxLength" placeholder="Добавьте описание вашей истории"></textarea>
            <div class="new-post__counter">
              {{ postsStore.form.description.length }} / {{ maxLength }}
            </div>
            <span class="new-post__massege" :class="{ 'error': postsStore.errors.description }"
              v-if="postsStore.errors.description">
              {{ postsStore.errors.description }}
            </span>
          </div>

          <div class="new-post__wrap-btn">
            <BackBtn @close="handleClose" />
            <button class="new-post__btn btn-dark" type="submit" :disabled="postsStore.loading">
              {{ postsStore.loading ? 'Создание...' : 'Сохранить' }}
            </button>
          </div>
        </form>
      </div>

      <SuccessOverlay v-if="showSuccess" :message="successMessage" @close="closeSuccess" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router'
import { usePostsStore } from '../store/usePostsStore';
import BackBtn from '../components/BackBtn.vue';
import SuccessOverlay from '../components/SuccessPage.vue';

const postsStore = usePostsStore()
const router = useRouter()

const maxLength = 2000
const isOpen = ref(true);
const fileInput = ref<HTMLInputElement | null>(null)
const fileName = ref('')
const showSuccess = ref(false)
const successMessage = ref('')

// Очистка ошибок при вводе
const clearFieldError = (field: keyof typeof postsStore.errors) => {
  if (postsStore.errors[field]) {
    postsStore.errors[field] = ''
  }
  if (postsStore.errors.general) {
    postsStore.errors.general = ''
  }
}

function handleClose() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push({ path: '/' })
  }
}

function onFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    const file = target.files[0]
    fileName.value = file.name
    postsStore.setPhoto(file)
    if (postsStore.errors.photo) {
      postsStore.errors.photo = ''
    }
  } else {
    fileName.value = ''
    postsStore.form.photo = null
  }
}

const onSubmit = async () => {
  postsStore.clearErrors()

  const errors: Record<string, string> = {}

  if (!postsStore.form.photo) {
    errors.photo = 'Загрузите фото'
  }

  if (!postsStore.form.title?.trim()) {
    errors.title = 'Введите заголовок'
  }

  if (!postsStore.form.country?.trim()) {
    errors.country = 'Введите страну'
  }

  if (!postsStore.form.city?.trim()) {
    errors.city = 'Введите город'
  }

  if (!postsStore.form.description?.trim()) {
    errors.description = 'Введите описание'
  } else if (postsStore.form.description.length > maxLength) {
    errors.description = `Описание не должно превышать ${maxLength} символов`
  }

  if (Object.keys(errors).length > 0) {
    postsStore.errors = { ...postsStore.errors, ...errors }
    return
  }

  const createdPost = await postsStore.createPost()

  if (createdPost) {
    console.log('Пост создан:', createdPost)

    successMessage.value = 'Ваша история успешно добавлена'
    showSuccess.value = true

    postsStore.clearForm()
    fileName.value = ''

    setTimeout(() => {
      closeSuccess()
    }, 3000)
  }
}

function closeSuccess() {
  showSuccess.value = false
  handleClose()
}

onMounted(() => {
  postsStore.clearErrors()
  postsStore.clearForm()
})
</script>


<style scoped lang="scss">
@use '../assets/scss/btn';
@use '../assets/scss/_new-post.scss';
</style>