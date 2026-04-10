import { defineStore } from 'pinia'
import axios from 'axios'
import { useAuthStore } from './useAuthStore'

export interface UserProfile {
  id?: number
  full_name: string
  city: string
  country: string
  bio: string
  photo?: string | File | null
}

interface ProfileState {
  profile: UserProfile
  loading: boolean
  errors: Record<string, string>
}

const baseURL = 'https://travelblog.skillbox.cc/api'

function generateAvatarUrl(name: string): string {
  const encodedName = encodeURIComponent(name.trim())
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodedName}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&size=200`
}

export const useProfileStore = defineStore('profile', {
  state: (): ProfileState => ({
    profile: {
      full_name: '',
      city: '',
      country: '',
      bio: '',
      photo: ''
    },
    loading: false,
    errors: {}
  }),

  getters: {
    getUserProfile: (state) => state.profile,
    getLoading: (state) => state.loading,
    getErrors: (state) => state.errors,
    getAvatarUrl: (state) => {
      if (state.profile.photo) {
        if (typeof state.profile.photo === 'string') {
          if (state.profile.photo.startsWith('data:') ||
            state.profile.photo.startsWith('http') ||
            state.profile.photo.startsWith('blob:')) {
            return state.profile.photo
          }
          return `${baseURL}${state.profile.photo}`
        }
        if (state.profile.photo instanceof File) {
          return URL.createObjectURL(state.profile.photo)
        }
      }

      const name = state.profile.full_name || 'Пользователь'
      return generateAvatarUrl(name)
    }
  },

  actions: {
    async loadProfile() {
      this.loading = true
      try {
        const token = localStorage.getItem('authToken')
        const response = await axios.get(`${baseURL}/user`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        })

        if (response.data) {
          this.profile = {
            full_name: response.data.full_name || '',
            city: response.data.city || '',
            country: response.data.country || '',
            bio: response.data.bio || '',
            id: response.data.id,
            photo: ''
          }

          const savedPhoto = localStorage.getItem(`user_photo_${response.data.id}`)
          if (savedPhoto) {
            this.profile.photo = savedPhoto

            const authStore = useAuthStore()
            authStore.updateUserAvatar(savedPhoto)
          }
        }

        this.loading = false
        return true
      } catch (error: any) {
        this.loading = false
        console.error('Ошибка загрузки профиля:', error)
        return false
      }
    },

    async saveProfile(profileData: UserProfile) {
      this.loading = true
      this.errors = {}

      try {
        const token = localStorage.getItem('authToken')

        const jsonData = {
          full_name: profileData.full_name || '',
          city: profileData.city || '',
          country: profileData.country || '',
          bio: profileData.bio || ''
        }

        const response = await axios.post(`${baseURL}/user`, jsonData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        })

        this.profile = {
          ...this.profile,
          full_name: response.data.full_name || '',
          city: response.data.city || '',
          country: response.data.country || '',
          bio: response.data.bio || '',
          id: response.data.id
        }

        if (profileData.photo instanceof File) {
          await this.savePhotoLocally(profileData.photo)
        } else if (profileData.photo === null) {
          this.clearAvatar()
        } else if (typeof profileData.photo === 'string' && profileData.photo) {
          this.profile.photo = profileData.photo
          if (this.profile.id) {
            localStorage.setItem(`user_photo_${this.profile.id}`, profileData.photo)

            const authStore = useAuthStore()
            authStore.updateUserAvatar(profileData.photo)
          }
        }

        const authStore = useAuthStore()
        authStore.updateUserData({
          id: response.data.id,
          full_name: response.data.full_name || '',
          avatar: this.profile.photo as string || ''
        })

        this.loading = false
        return true
      } catch (error: any) {
        this.loading = false
        console.error('Ошибка сохранения профиля:', error)
        return false
      }
    },

    async savePhotoLocally(photoFile: File) {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader()

        reader.onload = (e) => {
          try {
            const base64 = e.target?.result as string
            this.profile.photo = base64

            if (this.profile.id) {
              localStorage.setItem(`user_photo_${this.profile.id}`, base64)

              const authStore = useAuthStore()
              authStore.updateUserAvatar(base64)
            }

            resolve(base64)
          } catch (error) {
            reject(error)
          }
        }

        reader.onerror = reject
        reader.readAsDataURL(photoFile)
      })
    },

    clearErrors() {
      this.errors = {}
    },

    updateAvatar(photo: string | File) {
      if (typeof photo === 'string') {
        this.profile.photo = photo
        if (this.profile.id) {
          localStorage.setItem(`user_photo_${this.profile.id}`, photo)
        }
      } else if (photo instanceof File) {
        this.savePhotoLocally(photo)
      }
    },

    clearAvatar() {
      this.profile.photo = ''
      if (this.profile.id) {
        localStorage.removeItem(`user_photo_${this.profile.id}`)

        const authStore = useAuthStore()
        authStore.updateUserAvatar('')
      }
    },

    loadTemporaryPhoto() {
      const tempPhoto = sessionStorage.getItem('temp_user_photo')
      if (tempPhoto && this.profile.id) {
        this.profile.photo = tempPhoto
        localStorage.setItem(`user_photo_${this.profile.id}`, tempPhoto)
        sessionStorage.removeItem('temp_user_photo')
        console.log('Временное фото перемещено в localStorage')
      }
    }
  }
})