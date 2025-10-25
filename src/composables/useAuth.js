// src/composables/useAuth.js
/**
 * Authentication Composable
 * @module useAuth
 * @description This module provides a composable for managing user authentication in the application.
 * It defines methods for logging in, signing up, logging out, and checking authentication status.
 * It integrates with the authentication store and provides reactive properties for user state.
 * @version 1.0.0
 * @author GreyPanda
 *
 * @changelog
 * - 1.0.0 (2025-06-02): Initial version with basic authentication functionality.
 */

import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

export const useAuth = () => {
  const authStore = useAuthStore()
  const router = useRouter()

  const user = computed(() => authStore.user)
  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const isLoading = computed(() => authStore.isLoading)

  const login = async (credentials) => {
    const result = await authStore.login(
      credentials.email,
      credentials.password,
      credentials.captchaToken,
    )

    if (result.success) {
      // Redirect to intended page or home
      const redirect = router.currentRoute.value.query.redirect || '/'
      router.push(redirect)
    }

    return result
  }

  const logout = async () => {
    const result = await authStore.logout()

    if (result.success) {
      router.push('/login')
    }

    return result
  }

  const signup = async (credentials) => {
    return await authStore.signup(
      credentials.email,
      credentials.password,
      credentials.name,
      credentials.captchaToken,
    )
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    signup,
  }
}
