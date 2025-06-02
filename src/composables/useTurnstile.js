// src/composables/useTurnstile.js
/**
 * Use Turnstile Composable
 * @module useTurnstile
 * @description This composable handles loading and managing the Cloudflare Turnstile CAPTCHA.
 * It provides a reactive state to track if the Turnstile script is loaded and handles errors during loading.
 * It can be used in Vue components to integrate Turnstile CAPTCHA functionality.
 * @version 1.0.0
 * @author GreyPanda
 *
 * @changelog
 * - 1.0.0 (2025-06-02): Initial version with Turnstile loading functionality.
 */

import { ref, onMounted, onUnmounted } from 'vue'

export const useTurnstile = () => {
  const isLoaded = ref(false)
  const error = ref(null)

  const loadTurnstile = () => {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (window.turnstile) {
        isLoaded.value = true
        resolve(window.turnstile)
        return
      }

      // Check if script is already loading
      if (document.querySelector('script[src*="turnstile"]')) {
        // Wait for it to load
        const checkLoaded = setInterval(() => {
          if (window.turnstile) {
            clearInterval(checkLoaded)
            isLoaded.value = true
            resolve(window.turnstile)
          }
        }, 100)

        setTimeout(() => {
          clearInterval(checkLoaded)
          reject(new Error('Turnstile script load timeout'))
        }, 10000)
        return
      }

      // Load the script
      const script = document.createElement('script')
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
      script.async = true
      script.defer = true

      script.onload = () => {
        isLoaded.value = true
        resolve(window.turnstile)
      }

      script.onerror = () => {
        error.value = 'Failed to load CAPTCHA'
        reject(new Error('Failed to load Turnstile script'))
      }

      document.head.appendChild(script)
    })
  }

  return {
    isLoaded,
    error,
    loadTurnstile,
  }
}
