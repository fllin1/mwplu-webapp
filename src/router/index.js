// src/router/index.js
/**
 * Vue Router Module
 * @module router
 * @description Vue Router configuration for the application.
 * This file defines the routes and navigation guards for the application.
 * It ensures that users are redirected to the appropriate views based on their authentication status.
 * It also handles the initialization of the authentication state.
 * @version 1.0.0
 * @author GreyPanda
 *
 * @changelog
 * - 1.0.0 (2025-06-02): Initial version with basic routing and authentication guards.
 */

import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Import your views
import HomeView from '@/views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import SignupView from '@/views/SignupView.vue'
import ConfirmationView from '@/views/ConfirmationView.vue'
import ResetPasswordView from '@/views/ResetPasswordView.vue'
import ProfileView from '@/views/ProfileView.vue'
import PluSynthesisView from '@/views/PluSynthesisView.vue'
import ContactView from '@/views/ContactView.vue'
import NotFoundView from '@/views/NotFoundView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: {
      title: 'Accueil - MWPLU',
      requiresAuth: false,
    },
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: {
      title: 'Connexion - MWPLU',
      requiresAuth: false,
      requiresGuest: true,
    },
  },
  {
    path: '/signup',
    name: 'signup',
    component: SignupView,
    meta: {
      title: 'Inscription - MWPLU',
      requiresAuth: false,
      requiresGuest: true,
    },
  },
  {
    path: '/confirmation',
    name: 'confirmation',
    component: ConfirmationView,
    meta: {
      title: "Confirmation de l'email - MWPLU",
      requiresAuth: false,
    },
  },
  {
    path: '/reset-password',
    name: 'reset-password',
    component: ResetPasswordView,
    meta: {
      title: 'Réinitialisation du mot de passe - MWPLU',
      requiresAuth: false,
    },
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfileView,
    meta: {
      title: 'Profile - MWPLU',
      requiresAuth: true,
    },
  },
  {
    path: '/plu-synthesis',
    name: 'plu-synthesis',
    component: PluSynthesisView,
    meta: {
      title: 'Synthèse du PLU - MWPLU',
      requiresAuth: true,
    },
  },
  {
    path: '/contact',
    name: 'contact',
    component: ContactView,
    meta: {
      title: 'Contact - MWPLU',
      requiresAuth: false,
    },
  },
  {
    path: '/404',
    name: 'not-found',
    component: NotFoundView,
    meta: { title: 'Page Not Found - MWPLU' },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404',
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
})

// Navigation Guards
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Set page title
  if (to.meta.title) {
    document.title = to.meta.title
  }

  // Check if we need to initialize auth state
  if (!authStore.isInitialized) {
    await authStore.initializeAuth()
  }

  const isAuthenticated = authStore.isAuthenticated
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
  const requiresGuest = to.matched.some((record) => record.meta.requiresGuest)

  // Route requires authentication but user is not authenticated
  if (requiresAuth && !isAuthenticated) {
    next({
      name: 'login',
      query: { redirect: to.fullPath },
    })
    return
  }

  // Route requires guest (login/signup) but user is authenticated
  if (requiresGuest && isAuthenticated) {
    const redirect = to.query.redirect || '/'
    next(redirect)
    return
  }

  next()
})

// After navigation
router.afterEach((to) => {
  // You can add analytics tracking here if needed
  // gtag('config', 'GA_TRACKING_ID', { page_path: to.path })
})

export default router
