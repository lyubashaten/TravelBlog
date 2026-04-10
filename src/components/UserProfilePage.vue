<template>
  <div class="profile">
    <div class="container">
      <!-- Сообщения об ошибках -->
      <div v-if="errors.general" class="error-message">
        {{ errors.general }}
      </div>

      <div v-if="!isEditing" class="profile__wrap-profile">
        <button class="profile__btn-settings" @click="startEditing" :disabled="loading">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M2 26H30V28H2V26ZM25.4 9C26.2 8.2 26.2 7 25.4 6.2L21.8 2.6C21 1.8 19.8 1.8 19 2.6L4 17.6V24H10.4L25.4 9ZM20.4 4L24 7.6L21 10.6L17.4 7L20.4 4ZM6 22V18.4L16 8.4L19.6 12L9.6 22H6Z"
              fill="#BDBDBD" />
          </svg>
        </button>
        <div class="profile__wrap-left">
          <div class="profile__avatar-container">
            <img class="profile__img" :src="avatarUrl" alt="Аватар пользователя" />
            <input ref="fileInput" type="file" accept="image/*" style="display: none" @change="onFileChange" />
            <button class="profile__btn-change" @click="openFileDialog">
              <svg width="24" height="22" viewBox="0 0 24 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 16.9733C13.3929 16.9733 14.5702 16.4929 15.532 15.532C16.4938 14.5711 16.9747 13.3938 16.9747 12C16.9747 10.6062 16.4938 9.42889 15.532 8.468C14.5702 7.50711 13.3929 7.02622 12 7.02533C10.6071 7.02444 9.42978 7.50533 8.468 8.468C7.50622 9.43067 7.02533 10.608 7.02533 12C7.02533 13.392 7.50622 14.5693 8.468 15.532C9.42978 16.4947 10.6071 16.9756 12 16.9747M12 15.6413C10.9644 15.6413 10.0987 15.2933 9.40267 14.5973C8.70667 13.9013 8.35867 13.0356 8.35867 12C8.35867 10.9644 8.70667 10.0987 9.40267 9.40267C10.0987 8.70667 10.9644 8.35867 12 8.35867C13.0356 8.35867 13.9013 8.70667 14.5973 9.40267C15.2933 10.0987 15.6413 10.9644 15.6413 12C15.6413 13.0356 15.2933 13.9013 14.5973 14.5973C13.9013 15.2933 13.0356 15.6413 12 15.6413ZM2.15467 21.3333C1.54044 21.3333 1.028 21.128 0.617333 20.7173C0.206667 20.3067 0.000888889 19.7938 0 19.1787V4.82133C0 4.20711 0.205778 3.69467 0.617333 3.284C1.02889 2.87333 1.54089 2.66756 2.15333 2.66667H6.09733L8.564 0H15.436L17.9027 2.66667H21.8467C22.46 2.66667 22.972 2.87244 23.3827 3.284C23.7933 3.69556 23.9991 4.208 24 4.82133V19.18C24 19.7933 23.7942 20.3058 23.3827 20.7173C22.9711 21.1289 22.4591 21.3342 21.8467 21.3333H2.15467ZM2.15467 20H21.8467C22.0858 20 22.2822 19.9231 22.436 19.7693C22.5898 19.6156 22.6667 19.4191 22.6667 19.18V4.82C22.6667 4.58089 22.5898 4.38444 22.436 4.23067C22.2822 4.07689 22.0858 4 21.8467 4H17.3173L14.8587 1.33333H9.14133L6.68267 4H2.15333C1.91422 4 1.71778 4.07689 1.564 4.23067C1.41022 4.38444 1.33333 4.58133 1.33333 4.82133V19.18C1.33333 19.4191 1.41022 19.6156 1.564 19.7693C1.71778 19.9231 1.91467 20 2.15467 20Z"
                  fill="#FFA902" />
              </svg>
              <span class="profile__btn-text">Изменить фото</span>
            </button>
          </div>
        </div>
        <div class="profile__wrap-right">
          <h2 class="profile__name">{{ profile.full_name || 'Не указано' }}</h2>
          <div class="profile__wrap-info">
            <span class="profile__key">Город:</span>
            <span class="profile__value">{{ profile.city || 'Не указан' }}</span>
          </div>
          <div class="profile__wrap-info">
            <span class="profile__key">Страна:</span>
            <span class="profile__value">{{ profile.country || 'Не указана' }}</span>
          </div>
          <div class="profile__wrap-info">
            <span class="profile__key">О себе:</span>
            <p class="profile__value profile__value--size">{{ profile.bio || 'Не указано' }}</p>
          </div>
        </div>
      </div>

      <!-- Редактирование профиля -->
      <div v-else class="new-post profile__wrap-profile profile__wrap-profile--position">
        <div class="profile__wrap-left">
          <div class="profile__avatar-container">
            <img class="profile__img" :src="avatarUrl" alt="Аватар" />
            <input ref="fileInput" type="file" accept="image/*" style="display: none" @change="onFileChange" />
            <button class="profile__btn-change" @click="openFileDialog">
              <svg width="24" height="22" viewBox="0 0 24 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 16.9733C13.3929 16.9733 14.5702 16.4929 15.532 15.532C16.4938 14.5711 16.9747 13.3938 16.9747 12C16.9747 10.6062 16.4938 9.42889 15.532 8.468C14.5702 7.50711 13.3929 7.02622 12 7.02533C10.6071 7.02444 9.42978 7.50533 8.468 8.468C7.50622 9.43067 7.02533 10.608 7.02533 12C7.02533 13.392 7.50622 14.5693 8.468 15.532C9.42978 16.4947 10.6071 16.9756 12 16.9747M12 15.6413C10.9644 15.6413 10.0987 15.2933 9.40267 14.5973C8.70667 13.9013 8.35867 13.0356 8.35867 12C8.35867 10.9644 8.70667 10.0987 9.40267 9.40267C10.0987 8.70667 10.9644 8.35867 12 8.35867C13.0356 8.35867 13.9013 8.70667 14.5973 9.40267C15.2933 10.0987 15.6413 10.9644 15.6413 12C15.6413 13.0356 15.2933 13.9013 14.5973 14.5973C13.9013 15.2933 13.0356 15.6413 12 15.6413ZM2.15467 21.3333C1.54044 21.3333 1.028 21.128 0.617333 20.7173C0.206667 20.3067 0.000888889 19.7938 0 19.1787V4.82133C0 4.20711 0.205778 3.69467 0.617333 3.284C1.02889 2.87333 1.54089 2.66756 2.15333 2.66667H6.09733L8.564 0H15.436L17.9027 2.66667H21.8467C22.46 2.66667 22.972 2.87244 23.3827 3.284C23.7933 3.69556 23.9991 4.208 24 4.82133V19.18C24 19.7933 23.7942 20.3058 23.3827 20.7173C22.9711 21.1289 22.4591 21.3342 21.8467 21.3333H2.15467ZM2.15467 20H21.8467C22.0858 20 22.2822 19.9231 22.436 19.7693C22.5898 19.6156 22.6667 19.4191 22.6667 19.18V4.82C22.6667 4.58089 22.5898 4.38444 22.436 4.23067C22.2822 4.07689 22.0858 4 21.8467 4H17.3173L14.8587 1.33333H9.14133L6.68267 4H2.15333C1.91422 4 1.71778 4.07689 1.564 4.23067C1.41022 4.38444 1.33333 4.58133 1.33333 4.82133V19.18C1.33333 19.4191 1.41022 19.6156 1.564 19.7693C1.71778 19.9231 1.91467 20 2.15467 20Z"
                  fill="#FFA902" />
              </svg>
              <span class="profile__btn-text">Изменить фото</span>
            </button>
            <button v-if="selectedPhoto" class="profile__btn-remove" @click="removePhoto">
              Удалить фото
            </button>
          </div>
        </div>
        <div class="profile__wrap-right">
          <div class="new-post__wrap-input">
            <label class="new-post__label" for="full_name">ФИО</label>
            <input v-model="editableProfile.full_name" class="new-post__input new-post__input--settings"
              :class="{ 'error': errors.full_name }" id="full_name" type="text" placeholder="Введите ваше ФИО"
              required />
            <span class="new-post__massege" :class="{ 'error': errors.full_name }" v-if="errors.full_name">
              {{ errors.full_name }}
            </span>
          </div>

          <div class="new-post__wrap-input">
            <label class="new-post__label" for="city">Город</label>
            <input v-model="editableProfile.city" class="new-post__input new-post__input--settings"
              :class="{ 'error': errors.city }" id="city" type="text" placeholder="Введите название города" required />
            <span class="new-post__massege" :class="{ 'error': errors.city }" v-if="errors.city">
              {{ errors.city }}
            </span>
          </div>

          <div class="new-post__wrap-input">
            <label class="new-post__label" for="country">Страна</label>
            <input v-model="editableProfile.country" class="new-post__input new-post__input--settings"
              :class="{ 'error': errors.country }" id="country" type="text" placeholder="Введите название страны" />
            <span class="new-post__massege" :class="{ 'error': errors.country }" v-if="errors.country">
              {{ errors.country }}
            </span>
          </div>

          <div class="new-post__wrap-input new-post__wrap-input--position">
            <label class="new-post__label new-post__label--affter" for="bio">О себе</label>
            <textarea class="new-post__textarea new-post__textarea--settings" :class="{ 'error': errors.bio }" id="bio"
              rows="5" cols="30" :maxlength="maxLength" placeholder="Расскажите о себе"
              v-model="editableProfile.bio"></textarea>
            <div class="new-post__counter">
              {{ editableProfile.bio.length }} / {{ maxLength }}
            </div>
            <span class="new-post__massege" :class="{ 'error': errors.bio }" v-if="errors.bio">
              {{ errors.bio }}
            </span>
          </div>

          <!-- Секция смены пароля -->
          <div class="new-post__password">
            <h3 class="new-post__heading">Смена пароля</h3>
            <div class="new-post__wrap-info">
              <div class="new-post__wrap-input">
                <label class="new-post__label" for="password">Новый пароль</label>
                <input v-model="passwordStore.form.password"
                  @input="passwordStore.validatePasswords(); clearPasswordFieldError('password')"
                  class="new-post__input new-post__input--password" :class="{ 'error': passwordStore.errors.password }"
                  id="password" type="password" placeholder="Введите новый пароль" />
                <span class="new-post__massege" :class="{ 'error': passwordStore.errors.password }"
                  v-if="passwordStore.errors.password">
                  {{ passwordStore.errors.password }}
                </span>
              </div>

              <div class="new-post__wrap-input">
                <label class="new-post__label" for="password_confirmation">Повторите пароль</label>
                <input v-model="passwordStore.form.password_confirmation"
                  @input="passwordStore.validatePasswords(); clearPasswordFieldError('password_confirmation')"
                  class="new-post__input new-post__input--password"
                  :class="{ 'error': passwordStore.errors.password_confirmation }" id="password_confirmation"
                  type="password" placeholder="Повторите новый пароль" />
                <span class="new-post__massege" :class="{ 'error': passwordStore.errors.password_confirmation }"
                  v-if="passwordStore.errors.password_confirmation">
                  {{ passwordStore.errors.password_confirmation }}
                </span>
              </div>
            </div>
          </div>


          <div class="new-post__wrap-btn">
            <button class="new-post__btn btn-light" @click="cancelEditing" :disabled="loading">
              Назад
            </button>
            <button class="new-post__btn btn-dark" @click="saveProfile" :disabled="loading">
              {{ loading ? 'Сохранение...' : 'Сохранить' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, computed, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { useProfileStore, type UserProfile } from '../store/useProfileStore';
import { useAuthStore } from '../store/useAuthStore';
import { usePasswordStore } from '../store/usePasswordStore';
import { storeToRefs } from 'pinia';

const router = useRouter();
const profileStore = useProfileStore()
const authStore = useAuthStore()
const passwordStore = usePasswordStore()
const { profile, loading, errors } = storeToRefs(profileStore)

const maxLength = 600
const fileInput = ref<HTMLInputElement | null>(null)
const isEditing = ref(false);
const selectedPhoto = ref<File | null>(null)

const avatarUrl = computed(() => {
  if (selectedPhoto.value) {
    return URL.createObjectURL(selectedPhoto.value)
  }
  return profileStore.getAvatarUrl
})

const editableProfile = reactive<UserProfile>({
  full_name: '',
  city: '',
  country: '',
  bio: '',
  photo: undefined
})

onMounted(async () => {
  console.log('Компонент профиля монтируется')
  await profileStore.loadProfile()
  if (!profile.value.full_name && !profile.value.city && !profile.value.bio) {
    isEditing.value = true
  }
})

function openFileDialog() {
  fileInput.value?.click()
}

function onFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    selectedPhoto.value = target.files[0]
  } else {
    selectedPhoto.value = null
  }
}

function removePhoto() {
  selectedPhoto.value = null
  editableProfile.photo = null

  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

function startEditing() {
  Object.assign(editableProfile, profile.value)
  editableProfile.photo = profile.value.photo
  isEditing.value = true
  profileStore.clearErrors()
  passwordStore.clearErrors()
}

const clearPasswordFieldError = (field: keyof typeof passwordStore.errors) => {
  passwordStore.errors[field] = ''
}

async function saveProfile() {
  console.log('Сохранение профиля...')

  profileStore.clearErrors()
  passwordStore.clearErrors()

  if (!editableProfile.full_name.trim()) {
    profileStore.errors.full_name = 'Пожалуйста, введите ФИО'
    return
  }

  const shouldChangePassword = passwordStore.form.password.trim() !== '' ||
    passwordStore.form.password_confirmation.trim() !== ''

  if (shouldChangePassword) {
    if (!passwordStore.form.password.trim()) {
      passwordStore.errors.password = 'Введите новый пароль'
      return
    }

    if (!passwordStore.form.password_confirmation.trim()) {
      passwordStore.errors.password_confirmation = 'Повторите новый пароль'
      return
    }

    if (passwordStore.form.password.length < 6) {
      passwordStore.errors.password = 'Пароль должен содержать минимум 6 символов'
      return
    }

    passwordStore.validatePasswords()
    if (passwordStore.errors.password_confirmation) {
      return
    }

    console.log('Попытка смены пароля...')
    const passwordChanged = await passwordStore.changePassword()

    if (!passwordChanged) {
      console.log('Ошибка при смене пароля')
      return
    }

    console.log('Пароль успешно изменен')
    await authStore.logout()
    await router.push('/login')
    alert('Пароль успешно изменен. Пожалуйста, войдите с новым паролем.')
    return
  }

  let photoToSave: File | string | null | undefined

  if (selectedPhoto.value) {
    photoToSave = selectedPhoto.value
  } else if (editableProfile.photo === null) {
    photoToSave = null
  } else {
    photoToSave = editableProfile.photo
  }

  const profileData: UserProfile = {
    ...editableProfile,
    photo: photoToSave
  }

  const success = await profileStore.saveProfile(profileData)

  if (success) {
    console.log('Профиль успешно сохранен')
    isEditing.value = false
    selectedPhoto.value = null

    if (fileInput.value) {
      fileInput.value.value = ''
    }

    passwordStore.form.password = ''
    passwordStore.form.password_confirmation = ''
    passwordStore.clearErrors()
  } else {
    console.log('Ошибка при сохранении профиля')
  }
}

function cancelEditing() {
  isEditing.value = false
  selectedPhoto.value = null
  profileStore.clearErrors()
  passwordStore.clearErrors()

  passwordStore.form.password = ''
  passwordStore.form.password_confirmation = ''
}

onBeforeUnmount(() => {
  if (selectedPhoto.value) {
    URL.revokeObjectURL(avatarUrl.value)
  }
})
</script>

<style scoped lang="scss">
@use '../assets/scss/new-post';
@use '../assets/scss/profile';
@use '../assets/scss/btn';
</style>