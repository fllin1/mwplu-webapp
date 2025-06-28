<template>
  <div class="turnstile-container">
    <!-- Turnstile widget will be rendered here -->
    <div ref="turnstileElement" class="turnstile-widget"></div>

    <!-- Loading state -->
    <div v-if="isLoading" class="turnstile-loading">
      <div class="spinner"></div>
      <span>Chargement de la vérification...</span>
    </div>

    <!-- Error state -->
    <div v-if="error" class="turnstile-error">
      <span>{{ error }}</span>
      <button @click="retry" class="retry-button">
        Réessayer
      </button>
    </div>
  </div>
</template>

<script>
/**
 * TurnstileWidget Component
 * @description Reusable Cloudflare Turnstile CAPTCHA widget for form validation
 *
 * Why we need this:
 * - Protects forms from bot submissions
 * - Required for login/signup security
 * - Provides a consistent CAPTCHA experience
 *
 * How it works:
 * 1. Loads Turnstile script from Cloudflare
 * 2. Renders the widget in the DOM
 * 3. Emits token when user completes verification
 * 4. Handles errors and retries gracefully
 *
 * Communication:
 * - Emits 'verified' event with token when successful
 * - Emits 'error' event when verification fails
 * - Emits 'expired' event when token expires
 */
import { ref, onMounted, onUnmounted, nextTick } from 'vue'

export default {
  name: 'TurnstileWidget',

  // Props allow parent components to configure the widget
  props: {
    siteKey: {
      type: String,
      required: true,
      validator: (value) => value && value.length > 0
    },
    // NOTE : We'll use only the default theme
    // theme: {
    //   type: String,
    //   default: 'light',
    //   validator: (value) => ['light', 'dark', 'auto'].includes(value)
    // },
    size: {
      type: String,
      default: 'normal',
      validator: (value) => ['normal', 'compact'].includes(value)
    }
  },

  // Events this component emits to parent
  emits: ['verified', 'error', 'expired'],

  setup(props, { emit }) {
    // Reactive state
    const turnstileElement = ref(null)
    const isLoading = ref(true)
    const error = ref(null)
    const widgetId = ref(null)
    const isScriptLoaded = ref(false)

    /**
     * Load Turnstile script from Cloudflare CDN
     * We load it dynamically to avoid blocking page render
     */
    const loadTurnstileScript = () => {
      return new Promise((resolve, reject) => {
        // Check if script already exists
        if (window.turnstile) {
          isScriptLoaded.value = true
          resolve()
          return
        }

        const script = document.createElement('script')
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
        script.async = true
        script.defer = true

        script.onload = () => {
          isScriptLoaded.value = true
          resolve()
        }

        script.onerror = () => {
          reject(new Error('Failed to load Turnstile script'))
        }

        document.head.appendChild(script)
      })
    }

    /**
     * Render the Turnstile widget
     * This creates the visual CAPTCHA challenge
     */
    const renderWidget = async () => {
      try {
        if (!turnstileElement.value || !window.turnstile) {
          throw new Error('Turnstile not ready')
        }

        // Configure widget options
        const options = {
          sitekey: props.siteKey,
          theme: props.theme,
          size: props.size,
          callback: (token) => {
            // User successfully completed the challenge
            error.value = null
            emit('verified', token)
          },
          'error-callback': (errorCode) => {
            // Challenge failed or errored
            const errorMessage = getErrorMessage(errorCode)
            error.value = errorMessage
            emit('error', errorMessage)
          },
          'expired-callback': () => {
            // Token expired, user needs to retry
            emit('expired')
          }
        }

        // Render the widget and store its ID for later cleanup
        widgetId.value = window.turnstile.render(turnstileElement.value, options)
        isLoading.value = false
      } catch (err) {
        console.error('Failed to render Turnstile widget:', err)
        error.value = 'Erreur de chargement de la vérification'
        isLoading.value = false
      }
    }

    /**
     * Convert Turnstile error codes to user-friendly messages
     */
    const getErrorMessage = (errorCode) => {
      const errorMessages = {
        'network-error': 'Erreur de connexion. Vérifiez votre connexion internet.',
        'configuration-error': 'Erreur de configuration. Contactez le support.',
        'internal-error': 'Erreur interne. Veuillez réessayer.',
        'timeout-or-duplicate': 'Délai dépassé. Veuillez réessayer.'
      }

      return errorMessages[errorCode] || 'Erreur de vérification. Veuillez réessayer.'
    }

    /**
     * Reset and retry the widget
     * Useful when user wants to try again after an error
     */
    const retry = async () => {
      error.value = null
      isLoading.value = true

      if (widgetId.value && window.turnstile) {
        // Remove existing widget
        window.turnstile.remove(widgetId.value)
        widgetId.value = null
      }

      // Wait for DOM update, then render again
      await nextTick()
      await renderWidget()
    }

    /**
     * Initialize the widget when component mounts
     */
    const initialize = async () => {
      try {
        await loadTurnstileScript()
        await renderWidget()
      } catch (err) {
        console.error('Turnstile initialization failed:', err)
        error.value = 'Impossible de charger la vérification'
        isLoading.value = false
      }
    }

    // Lifecycle hooks
    onMounted(() => {
      initialize()
    })

    onUnmounted(() => {
      // Clean up widget when component is destroyed
      if (widgetId.value && window.turnstile) {
        window.turnstile.remove(widgetId.value)
      }
    })

    // Expose methods and state to template
    return {
      turnstileElement,
      isLoading,
      error,
      retry
    }
  }
}
</script>

<style scoped>
.turnstile-container {
  margin: var(--space-4) 0;
}

.turnstile-widget {
  display: flex;
  justify-content: center;
  min-height: 65px; /* Standard Turnstile height */
}

.turnstile-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-4);
  font-size: var(--font-size-sm);
  color: var(--color-gray-600);
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid var(--color-gray-300);
  border-top: 2px solid var(--color-blue);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.turnstile-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3);
  background-color: var(--color-gray-50);
  border: 1px solid var(--color-error);
  border-radius: var(--radius-form);
  font-size: var(--font-size-sm);
  color: var(--color-error);
}

.retry-button {
  padding: var(--space-2) var(--space-3);
  background-color: var(--color-blue);
  color: var(--color-white);
  border: none;
  border-radius: var(--radius-button);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.retry-button:hover {
  background-color: var(--color-blue-hover);
}

.retry-button:focus {
  outline: 2px solid var(--color-blue);
  outline-offset: 2px;
}
</style>
