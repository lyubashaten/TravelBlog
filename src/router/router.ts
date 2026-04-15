import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../store/useAuthStore'
import Home from '../views/Home.vue'
import CreateNewPost from '../views/CreateNewPost.vue'
import AuthorizationPage from '../views/AuthorizationPage.vue'
import RegistrationPage from '../views/RegistrationPage.vue'
import CreateComment from '../views/CreateComment.vue'
import ProfilePage from '../views/ProfilePage.vue'
import OnePostPage from '../views/OnePostPage.vue'
const routes = [
  // для списка постов
  {
    path: '/',
    component: Home
  },
  // для формы создания нового поста
  {
    path: `/create-post`,
    name: 'NewPost',
    component: CreateNewPost,
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: ProfilePage,
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: AuthorizationPage,
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: RegistrationPage,
    meta: { requiresGuest: true }
  },
  // для детальной страницы поста
  {
    path: `/posts/:id`,
    name: 'PostDetail',
    component: OnePostPage
  },
  // для детальной создания комментария
  {
    path: `/posts/:id/comments`,
    name: 'Comment',
    component: CreateComment
  },
]

const router = createRouter({
  history: createWebHistory('/TravelBlog/'),
  routes,
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    // Если маршрут требует авторизации, а пользователь не авторизован
    next('/login')
  } else {
    next()
  }
})
export default router