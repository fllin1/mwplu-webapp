// src/services/errorHandler.js
/**
 * Error Handler Module
 * @module errorHandler
 * @description This module provides a global error handler for the application.
 * It defines methods to show error, success, and warning messages, and handles Vue errors and unhandled promise rejections.
 * It can be used in Vue components to display error messages consistently.
 * @version 1.0.0
 * @author GreyPanda
 *
 * @changelog
 * - 1.0.0 (2025-06-02): Initial version with global error handling functionality.
 */

import { ref } from 'vue'

// Global error state
const globalError = ref(null)
const isErrorVisible = ref(false)

export const useErrorHandler = () => {
  const showError = (error, duration = 5000) => {
    console.error('Global error:', error)

    // Format error message
    let message = 'An unexpected error occurred'

    if (typeof error === 'string') {
      message = error
    } else if (error?.message) {
      message = error.message
    } else if (error?.response?.data?.message) {
      message = error.response.data.message
    }

    globalError.value = {
      message,
      timestamp: new Date(),
      type: 'error',
    }

    isErrorVisible.value = true

    // Auto-hide after duration
    if (duration > 0) {
      setTimeout(() => {
        hideError()
      }, duration)
    }
  }

  const showSuccess = (message, duration = 3000) => {
    globalError.value = {
      message,
      timestamp: new Date(),
      type: 'success',
    }

    isErrorVisible.value = true

    if (duration > 0) {
      setTimeout(() => {
        hideError()
      }, duration)
    }
  }

  const showWarning = (message, duration = 4000) => {
    globalError.value = {
      message,
      timestamp: new Date(),
      type: 'warning',
    }

    isErrorVisible.value = true

    if (duration > 0) {
      setTimeout(() => {
        hideError()
      }, duration)
    }
  }

  const hideError = () => {
    isErrorVisible.value = false
    // Clear after fade animation
    setTimeout(() => {
      globalError.value = null
    }, 300)
  }

  return {
    globalError,
    isErrorVisible,
    showError,
    showSuccess,
    showWarning,
    hideError,
  }
}

// Vue error handler plugin
export const errorHandlerPlugin = {
  install(app) {
    const { showError } = useErrorHandler()

    // Handle Vue errors
    app.config.errorHandler = (error, instance, info) => {
      console.error('Vue error:', error, info)
      showError(`Application error: ${error.message}`)
    }

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason)
      showError('An unexpected error occurred. Please try again.')
      event.preventDefault()
    })

    // Handle general JavaScript errors
    window.addEventListener('error', (event) => {
      console.error('JavaScript error:', event.error)
      showError('An unexpected error occurred. Please refresh the page.')
    })

    // Provide globally
    app.provide('errorHandler', useErrorHandler())
  },
}
