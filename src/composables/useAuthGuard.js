/**
 * useAuthGuard Composable
 * @module useAuthGuard
 * @description This composable provides authentication guard functionality for route protection.
 * @version 1.0.0
 * @author GreyPanda
 *
 * @changelog
 * - 1.0.0 (2025-06-08): Initial version with basic authentication guard functionality.
 *
 * Why we need this:
 * - Centralizes authentication logic for routes
 * - Prevents unauthorized access to protected pages
 * - Provides consistent redirect behavior
 * - Handles loading states during auth checks
 *
 * How it works:
 * 1. Checks if user is authenticated using auth store
 * 2. Redirects to login if not authenticated
 * 3. Preserves intended route for post-login redirect
 * 4. Provides utilities for conditional rendering
 *
 * Usage patterns:
 * - Route guards: beforeEnter: useAuthGuard()
 * - Component guards: onMounted(() => requireAuth())
 * - Conditional rendering: v-if="isAuthenticated"
 */

import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

/**
 * Main auth guard composable
 * @param {Object} options - Configuration options
 * @param {string} options.redirectTo - Where to redirect if not authenticated
 * @param {boolean} options.requireAdmin - Whether admin access is required
 * @param {Array} options.allowedRoles - Array of allowed user roles
 * @returns {Object} Auth guard utilities and state
 */
export function useAuthGuard(options = {}) {
  const router = useRouter()
  const route = useRoute()
  const authStore = useAuthStore()

  // Default options
  const config = {
    redirectTo: '/login',
    requireAdmin: false,
    allowedRoles: null,
    preserveRoute: true,
    ...options,
  }

  // Computed authentication state
  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const isLoading = computed(() => authStore.isLoading)
  const user = computed(() => authStore.user)
  const userRoles = computed(() => user.value?.app_metadata?.roles || [])

  /**
   * Check if user has required permissions
   * @param {Array} requiredRoles - Roles needed for access
   * @returns {boolean} Whether user has permission
   */
  const hasPermission = (requiredRoles = []) => {
    if (!isAuthenticated.value) return false
    if (!requiredRoles.length) return true

    return requiredRoles.some((role) => userRoles.value.includes(role))
  }

  /**
   * Check if user is admin
   * @returns {boolean} Whether user has admin privileges
   */
  const isAdmin = computed(() => {
    return userRoles.value.includes('admin') || userRoles.value.includes('super_admin')
  })

  /**
   * Build redirect URL with current route preservation
   * @param {string} targetRoute - Route to redirect to
   * @returns {Object} Router push object with query params
   */
  const buildRedirectUrl = (targetRoute) => {
    const redirectUrl = {
      path: targetRoute,
    }

    // Preserve intended route for post-auth redirect
    if (config.preserveRoute && route.path !== targetRoute) {
      redirectUrl.query = {
        redirect: route.fullPath,
      }
    }

    return redirectUrl
  }

  /**
   * Require authentication for current route
   * Redirects to login if not authenticated
   * @returns {Promise<boolean>} Whether access is granted
   */
  const requireAuth = async () => {
    // Wait for auth initialization if still loading
    if (isLoading.value) {
      await new Promise((resolve) => {
        const unwatch = authStore.$subscribe(() => {
          if (!authStore.isLoading) {
            unwatch()
            resolve()
          }
        })
      })
    }

    if (!isAuthenticated.value) {
      await router.push(buildRedirectUrl(config.redirectTo))
      return false
    }

    // Check role requirements
    if (config.allowedRoles && !hasPermission(config.allowedRoles)) {
      console.warn('Access denied: insufficient permissions')
      await router.push('/unauthorized')
      return false
    }

    // Check admin requirement
    if (config.requireAdmin && !isAdmin.value) {
      console.warn('Access denied: admin privileges required')
      await router.push('/unauthorized')
      return false
    }

    return true
  }

  /**
   * Require guest access (not authenticated)
   * Redirects authenticated users to dashboard
   * @param {string} redirectTo - Where to redirect authenticated users
   * @returns {Promise<boolean>} Whether access is granted
   */
  const requireGuest = async (redirectTo = '/dashboard') => {
    if (isLoading.value) {
      await new Promise((resolve) => {
        const unwatch = authStore.$subscribe(() => {
          if (!authStore.isLoading) {
            unwatch()
            resolve()
          }
        })
      })
    }

    if (isAuthenticated.value) {
      await router.push(redirectTo)
      return false
    }

    return true
  }

  /**
   * Conditional redirect based on auth status
   * @param {string} authRoute - Route for authenticated users
   * @param {string} guestRoute - Route for guest users
   */
  const conditionalRedirect = async (authRoute = '/dashboard', guestRoute = '/login') => {
    if (isLoading.value) return

    if (isAuthenticated.value) {
      await router.push(authRoute)
    } else {
      await router.push(guestRoute)
    }
  }

  /**
   * Vue Router beforeEnter guard function
   * Use this directly in route definitions
   * @param {Object} to - Target route
   * @param {Object} from - Source route
   * @param {Function} next - Router next function
   */
  const beforeEnterGuard = async (to, from, next) => {
    try {
      // Initialize auth if needed
      if (!authStore.isInitialized) {
        await authStore.initializeAuth()
      }

      if (!isAuthenticated.value) {
        // Redirect to login with return path
        next({
          path: config.redirectTo,
          query: config.preserveRoute ? { redirect: to.fullPath } : {},
        })
        return
      }

      // Check permissions
      if (config.allowedRoles && !hasPermission(config.allowedRoles)) {
        next('/unauthorized')
        return
      }

      if (config.requireAdmin && !isAdmin.value) {
        next('/unauthorized')
        return
      }

      // Access granted
      next()
    } catch (error) {
      console.error('Auth guard error:', error)
      next('/error')
    }
  }

  /**
   * Vue Router beforeEnter guard for guest-only routes
   * Redirects authenticated users away from login/signup pages
   */
  const guestOnlyGuard = async (to, from, next) => {
    try {
      if (!authStore.isInitialized) {
        await authStore.initializeAuth()
      }

      if (isAuthenticated.value) {
        // Redirect authenticated users to dashboard
        const redirect = to.query.redirect || '/dashboard'
        next(redirect)
        return
      }

      next()
    } catch (error) {
      console.error('Guest guard error:', error)
      next()
    }
  }

  return {
    // State
    isAuthenticated,
    isLoading,
    user,
    userRoles,
    isAdmin,

    // Permission checking
    hasPermission,

    // Route protection
    requireAuth,
    requireGuest,
    conditionalRedirect,

    // Router guards
    beforeEnterGuard,
    guestOnlyGuard,

    // Utilities
    buildRedirectUrl,
  }
}

/**
 * Simple auth guard for basic protection
 * Just checks authentication without role requirements
 * @returns {Function} beforeEnter guard function
 */
export function simpleAuthGuard() {
  const { beforeEnterGuard } = useAuthGuard()
  return beforeEnterGuard
}

/**
 * Admin-only auth guard
 * Requires admin role for access
 * @returns {Function} beforeEnter guard function
 */
export function adminAuthGuard() {
  const { beforeEnterGuard } = useAuthGuard({ requireAdmin: true })
  return beforeEnterGuard
}

/**
 * Role-based auth guard factory
 * @param {Array} allowedRoles - Array of allowed roles
 * @returns {Function} beforeEnter guard function
 */
export function roleAuthGuard(allowedRoles) {
  const { beforeEnterGuard } = useAuthGuard({ allowedRoles })
  return beforeEnterGuard
}

/**
 * Guest-only guard for login/signup pages
 * @returns {Function} beforeEnter guard function
 */
export function guestOnlyGuard() {
  const { guestOnlyGuard } = useAuthGuard()
  return guestOnlyGuard
}

/**
 * Hook for components that need auth checking
 * @param {Object} options - Auth requirements
 * @returns {Object} Auth utilities for components
 */
export function useAuthCheck(options = {}) {
  const { isAuthenticated, isLoading, user, hasPermission, requireAuth, requireGuest } =
    useAuthGuard(options)

  return {
    isAuthenticated,
    isLoading,
    user,
    hasPermission,
    requireAuth,
    requireGuest,
  }
}

// Default export for convenience
export default useAuthGuard
