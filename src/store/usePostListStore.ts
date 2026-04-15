import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Post } from '../types/Post'

export const usePostListStore = defineStore('postList', () => {
  // Все посты, полученные с сервера
  const allPosts = ref<Post[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  // Количество отображаемых постов (начинаем с 6)
  const displayedCount = ref(6)
  const loadingMore = ref(false)

  // Отображаемые посты – первые displayedCount из allPosts
  const posts = computed(() => allPosts.value.slice(0, displayedCount.value))

  // Есть ли ещё не показанные посты
  const hasMore = computed(() => displayedCount.value < allPosts.value.length)

  const decodeUnicode = (str: string): string => {
    try {
      return decodeURIComponent(JSON.parse('"' + str.replace(/\"/g, '\\"') + '"'))
    } catch (e) {
      return str
    }
  }

  const processPosts = (data: any[]): Post[] => {
    return data
      .filter(post => post.id && post.title && post.excerpt && post.photo)
      .map(post => ({
        ...post,
        title: decodeUnicode(post.title),
        excerpt: decodeUnicode(post.excerpt),
        county: decodeUnicode(post.county),
        city: decodeUnicode(post.city)
      }))
  }

  const fetchPosts = async () => {
    loading.value = true
    error.value = null
    displayedCount.value = 6 // сброс при обновлении

    try {
      console.log('Начало загрузки постов...')
      const response = await fetch('https://travelblog.skillbox.cc/api/posts')

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      const processedPosts = processPosts(data)
      allPosts.value = processedPosts
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error occurred'
      console.error('Error fetching posts:', err)
    } finally {
      loading.value = false
    }
  }

  const loadMore = () => {
    if (loadingMore.value || !hasMore.value) return
    loadingMore.value = true
    // Имитация задержки подгрузки (опционально)
    setTimeout(() => {
      displayedCount.value += 6
      loadingMore.value = false
    }, 300)
  }

  const getImageUrl = (photoPath: string) => {
    if (photoPath.startsWith('http')) {
      return photoPath
    }
    return `http://travelblog.skillbox.cc${photoPath}`
  }

  return {
    posts,          // computed – только нужное количество
    loading,
    error,
    hasMore,
    loadingMore,
    fetchPosts,
    loadMore,
    getImageUrl
  }
})