/**
 * useAnalytics Composable
 * @module useAnalytics
 * @description Provides Google Analytics 4 tracking functionality
 * @version 1.0.0
 * @author GreyPanda
 *
 * @changelog
 * - 1.0.0 (2025-06-08): Initial version with basic analytics functionality.
 *
 * Features:
 * - Custom event tracking
 * - User identification (hashed for privacy)
 * - E-commerce tracking for future features
 * - Error tracking and debugging
 * - GDPR compliance with opt-out options
 *
 * Privacy Considerations:
 * - User IDs are hashed for anonymity
 * - IP addresses are anonymized
 * - Users can opt-out of tracking
 * - No PII (personally identifiable information) is sent
 *
 * Events Tracked:
 * - Authentication events (login, signup, logout)
 * - PLU interactions (view, download, comment, rate)
 * - User flow events (city_selected, zone_selected)
 * - Conversion events (contact_form, payments)
 * - Error events for debugging
 */

import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import {
  trackEvent as firebaseTrackEvent,
  setAnalyticsUserId,
  setAnalyticsUserProperties,
} from '@/services/firebase'

// Global analytics state
const isInitialized = ref(false)
const isOptedOut = ref(false)
const debugMode = ref(import.meta.env.DEV)

/**
 * Analytics configuration
 */
const config = {
  // Google Analytics 4 measurement ID - using Firebase Analytics instead
  measurementId: 'G-FP4E0W6S41', // Firebase Analytics measurement ID

  // Cookie settings
  cookieDomain: 'auto',
  cookieExpires: 63072000, // 2 years

  // Privacy settings
  anonymizeIp: true,
  allowAdFeatures: false,
  allowGoogleSignals: false,

  // Custom dimensions (configure in GA4)
  customDimensions: {
    user_type: 'custom_1', // 'authenticated' | 'guest'
    user_role: 'custom_2', // 'admin' | 'user' | 'premium'
    page_type: 'custom_3', // 'auth' | 'plu' | 'dashboard' | 'static'
    device_type: 'custom_4', // 'mobile' | 'tablet' | 'desktop'
  },
}

/**
 * Hash function for user IDs (privacy protection)
 * @param {string} input - String to hash
 * @returns {string} Hashed string
 */
const hashString = (input) => {
  if (!input) return ''

  let hash = 0
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36)
}

/**
 * Detect device type based on screen size
 * @returns {string} Device type
 */
const getDeviceType = () => {
  const width = window.innerWidth
  if (width < 768) return 'mobile'
  if (width < 1024) return 'tablet'
  return 'desktop'
}

/**
 * Get user type for analytics
 * @param {Object} user - User object from auth store
 * @returns {string} User type
 */
const getUserType = (user) => {
  if (!user) return 'guest'
  return 'authenticated'
}

/**
 * Get user role for analytics
 * @param {Object} user - User object from auth store
 * @returns {string} User role
 */
const getUserRole = (user) => {
  if (!user) return 'guest'

  const roles = user.app_metadata?.roles || []
  if (roles.includes('admin') || roles.includes('super_admin')) return 'admin'
  if (roles.includes('premium')) return 'premium'
  return 'user'
}

/**
 * Main analytics composable
 */
export function useAnalytics() {
  const authStore = useAuthStore()

  // Computed properties
  const canTrack = computed(() => {
    return !isOptedOut.value && typeof window !== 'undefined'
  })

  const currentUser = computed(() => authStore.user)

  /**
   * Initialize Google Analytics
   * Call this in main.js after Vue app creation
   */
  const initialize = () => {
    if (isInitialized.value) return

    try {
      // Check for user opt-out preference
      const optOutPreference = localStorage.getItem('ga-opt-out')
      if (optOutPreference === 'true') {
        isOptedOut.value = true
        return
      }

      // Set user properties if authenticated
      if (currentUser.value) {
        setUserProperties(currentUser.value)
      }

      isInitialized.value = true

      if (debugMode.value) {
        console.log('📊 Analytics initialized via Firebase')
      }
    } catch (error) {
      console.error('Analytics initialization failed:', error)
    }
  }

  /**
   * Set user properties for analytics
   * @param {Object} user - User object
   */
  const setUserProperties = (user) => {
    if (!canTrack.value) return

    const userId = user ? hashString(user.id) : null
    const userType = getUserType(user)
    const userRole = getUserRole(user)
    const deviceType = getDeviceType()

    setAnalyticsUserId(userId)

    setAnalyticsUserProperties({
      user_type: userType,
      user_role: userRole,
      device_type: deviceType,
    })

    if (debugMode.value) {
      console.log('📊 Set user properties:', { userType, userRole, deviceType })
    }
  }

  /**
   * Track page view
   * @param {string} pageTitle - Page title
   * @param {string} pagePath - Page path
   * @param {string} pageType - Type of page (auth, plu, dashboard, static)
   */
  const trackPageView = (pageTitle, pagePath, pageType = 'static') => {
    if (!canTrack.value) return

    window.gtag('config', config.measurementId, {
      page_title: pageTitle,
      page_location: window.location.href,
      page_path: pagePath,
      [config.customDimensions.page_type]: pageType,
    })

    if (debugMode.value) {
      console.log('📊 Page view:', { pageTitle, pagePath, pageType })
    }
  }

  /**
   * Track custom event
   * @param {string} eventName - Name of the event
   * @param {Object} parameters - Event parameters
   */
  const trackEvent = (eventName, parameters = {}) => {
    if (!canTrack.value) return

    // Add default parameters
    const eventParams = {
      timestamp: Date.now(),
      user_type: getUserType(currentUser.value),
      device_type: getDeviceType(),
      ...parameters,
    }

    // Use Firebase Analytics
    firebaseTrackEvent(eventName, eventParams)

    // Fallback to gtag if available
    if (window.gtag) {
      window.gtag('event', eventName, eventParams)
    }

    if (debugMode.value) {
      console.log('📊 Event tracked:', eventName, eventParams)
    }
  }

  /**
   * Authentication Events
   */
  const trackLogin = (method = 'email') => {
    trackEvent('login', {
      method: method,
    })
  }

  const trackSignup = (method = 'email') => {
    trackEvent('signup', {
      method: method,
    })
  }

  const trackLogout = () => {
    trackEvent('logout')
  }

  /**
   * PLU Interaction Events
   */
  const trackPluView = (city, zone, pluId) => {
    trackEvent('plu_view', {
      content_type: 'plu_document',
      item_id: pluId,
      city: city,
      zone: zone,
    })
  }

  const trackPluDownload = (city, zone, pluId, fileType) => {
    trackEvent('plu_download', {
      content_type: 'plu_document',
      item_id: pluId,
      city: city,
      zone: zone,
      file_type: fileType,
    })
  }

  const trackPluComment = (pluId, commentLength) => {
    trackEvent('plu_comment', {
      content_type: 'comment',
      item_id: pluId,
      comment_length: commentLength,
    })
  }

  const trackPluRating = (pluId, rating) => {
    trackEvent('plu_rate', {
      content_type: 'rating',
      item_id: pluId,
      rating: rating,
    })
  }

  /**
   * User Flow Events
   */
  const trackCitySelected = (cityName, cityId) => {
    trackEvent('city_selected', {
      city_name: cityName,
      city_id: cityId,
    })
  }

  const trackZoneSelected = (cityName, zoneName, zoneId) => {
    trackEvent('zone_selected', {
      city_name: cityName,
      zone_name: zoneName,
      zone_id: zoneId,
    })
  }

  const trackSearch = (searchTerm, resultsCount) => {
    trackEvent('search', {
      search_term: searchTerm,
      results_count: resultsCount,
    })
  }

  /**
   * Conversion Events
   */
  const trackContactForm = (formType = 'general') => {
    trackEvent('contact_form_submitted', {
      form_type: formType,
    })
  }

  const trackPaymentInitiated = (value, currency = 'EUR', paymentMethod) => {
    trackEvent('begin_checkout', {
      value: value,
      currency: currency,
      payment_method: paymentMethod,
    })
  }

  const trackSubscriptionCompleted = (value, currency = 'EUR', subscriptionType) => {
    trackEvent('purchase', {
      value: value,
      currency: currency,
      transaction_id: `sub_${Date.now()}`,
      subscription_type: subscriptionType,
    })
  }

  /**
   * Error Tracking
   */
  const trackError = (errorType, errorMessage, errorLocation) => {
    trackEvent('exception', {
      description: errorMessage,
      fatal: false,
      error_type: errorType,
      error_location: errorLocation,
    })
  }

  /**
   * Privacy Controls
   */
  const optOut = () => {
    isOptedOut.value = true
    localStorage.setItem('ga-opt-out', 'true')

    // Disable GA tracking
    if (window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'denied',
      })
    }

    console.log('📊 Analytics opt-out enabled')
  }

  const optIn = () => {
    isOptedOut.value = false
    localStorage.removeItem('ga-opt-out')

    // Re-enable GA tracking
    if (window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'granted',
      })
    }

    console.log('📊 Analytics opt-in enabled')
  }

  /**
   * Debug Controls
   */
  const enableDebug = () => {
    debugMode.value = true
    console.log('📊 Analytics debug mode enabled')
  }

  const disableDebug = () => {
    debugMode.value = false
  }

  return {
    // State
    isInitialized,
    isOptedOut,
    debugMode,
    canTrack,

    // Core functions
    initialize,
    setUserProperties,
    trackPageView,
    trackEvent,

    // Authentication events
    trackLogin,
    trackSignup,
    trackLogout,

    // PLU interaction events
    trackPluView,
    trackPluDownload,
    trackPluComment,
    trackPluRating,

    // User flow events
    trackCitySelected,
    trackZoneSelected,
    trackSearch,

    // Conversion events
    trackContactForm,
    trackPaymentInitiated,
    trackSubscriptionCompleted,

    // Error tracking
    trackError,

    // Privacy controls
    optOut,
    optIn,

    // Debug controls
    enableDebug,
    disableDebug,
  }
}

// Default export for convenience
export default useAnalytics
