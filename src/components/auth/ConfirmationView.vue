<template>
  <div class="confirmation-container">
    <div class="confirmation-card">
      <!-- Success Icon -->
      <div class="icon-container">
        <div class="icon success-icon">
          📧
        </div>
      </div>

      <!-- Main Content -->
      <div class="confirmation-content">
        <h1 class="title">Vérifiez votre e-mail</h1>

        <p class="description">
          Nous avons envoyé un lien de confirmation à :
        </p>

        <div class="email-display">
          {{ userEmail }}
        </div>

        <p class="instructions">
          Cliquez sur le lien dans l'e-mail pour activer votre compte.
          Si vous ne trouvez pas l'e-mail, vérifiez votre dossier spam.
        </p>

        <!-- Countdown Timer -->
        <div v-if="resendCountdown > 0" class="countdown">
          Vous pourrez renvoyer l'e-mail dans {{ resendCountdown }} secondes
        </div>

        <!-- Resend Button -->
        <button
          v-else
          @click="resendConfirmation"
          :disabled="isResending"
          class="resend-button"
          :class="{ 'loading': isResending }"
        >
          <span v-if="isResending" class="button-spinner"></span>
          <span v-else>Renvoyer l'e-mail</span>
        </button>

        <!-- Success/Error Messages -->
        <div v-if="resendSuccess" class="success-message">
          E-mail de confirmation renvoyé avec succès !
        </div>

        <div v-if="resendError" class="error-message">
          {{ resendError }}
        </div>
      </div>

      <!-- Additional Actions -->
      <div class="confirmation-actions">
        <p class="help-text">
          Mauvaise adresse e-mail ?
        </p>

        <div class="action-buttons">
          <button @click="goBack" class="secondary-button">
            Modifier l'e-mail
          </button>

          <router-link to="/login" class="primary-button">
            Retour à la connexion
          </router-link>
        </div>
      </div>

      <!-- Help Section -->
      <div class="help-section">
        <details class="help-details">
          <summary class="help-summary">
            Besoin d'aide ?
          </summary>
          <div class="help-content">
            <ul class="help-list">
              <li>Vérifiez votre dossier spam ou courrier indésirable</li>
              <li>Assurez-vous que l'adresse e-mail est correcte</li>
              <li>L'e-mail peut prendre quelques minutes à arriver</li>
              <li>Contactez-nous si le problème persiste</li>
            </ul>

            <a href="/contact" class="contact-link">
              Contacter le support
            </a>
          </div>
        </details>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * ConfirmationView Component
 * @description Email confirmation page with resend functionality
 *
 * Features:
 * - Display user's email address
 * - Countdown timer for resend button
 * - Resend confirmation email
 * - Help section with troubleshooting
 * - Navigation back to signup or login
 *
 * UX Considerations:
 * - Clear instructions in French
 * - Visual feedback for all actions
 * - Prevents spam by limiting resend attempts
 * - Helpful troubleshooting information
 *
 * Security:
 * - Rate limiting on resend attempts
 * - No sensitive information displayed
 * - Proper error handling
 */
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'ConfirmationView',

  props: {
    email: {
      type: String,
      default: ''
    }
  },

  setup(props) {
    const router = useRouter()
    const route = useRoute()
    const authStore = useAuthStore()

    // Component state
    const isResending = ref(false)
    const resendSuccess = ref(false)
    const resendError = ref('')
    const resendCountdown = ref(60) // 60 seconds cooldown
    const countdownInterval = ref(null)

    // Get email from props, route params, or localStorage
    const userEmail = ref(
      props.email ||
      route.query.email ||
      localStorage.getItem('pendingConfirmationEmail') ||
      ''
    )

    /**
     * Start countdown timer
     * Prevents immediate resend attempts
     */
    const startCountdown = () => {
      resendCountdown.value = 60

      countdownInterval.value = setInterval(() => {
        resendCountdown.value--

        if (resendCountdown.value <= 0) {
          clearInterval(countdownInterval.value)
          countdownInterval.value = null
        }
      }, 1000)
    }

    /**
     * Resend confirmation email
     * Calls auth store method with error handling
     */
    const resendConfirmation = async () => {
      if (!userEmail.value) {
        resendError.value = 'Adresse e-mail manquante'
        return
      }

      try {
        isResending.value = true
        resendSuccess.value = false
        resendError.value = ''

        // Call auth store resend method
        const result = await authStore.resendConfirmation(userEmail.value)

        if (result.success) {
          resendSuccess.value = true
          resendError.value = ''

          // Start countdown to prevent spam
          startCountdown()

          // Clear success message after 5 seconds
          setTimeout(() => {
            resendSuccess.value = false
          }, 3000)
        } else {
          resendError.value = result.error || 'Erreur lors du renvoi'
        }

      } catch (error) {
        console.error('Resend confirmation error:', error)
        resendError.value = 'Une erreur inattendue s\'est produite'
      } finally {
        isResending.value = false
      }
    }

    /**
     * Go back to signup form
     * Preserves user data when possible
     */
    const goBack = () => {
      // Store current email for auto-fill
      if (userEmail.value) {
        sessionStorage.setItem('signupEmail', userEmail.value)
      }

      router.push('/signup')
    }

    /**
     * Handle email confirmation from URL
     * Automatically process if confirmation token is present
     */
    const handleConfirmationToken = async () => {
      const token = route.query.token || route.hash.substring(1)

      if (token) {
        try {
          // Process confirmation token
          const result = await authStore.confirmEmail(token)

          if (result.success) {
            // Redirect to dashboard on successful confirmation
            await router.push('/dashboard')
          } else {
            resendError.value = 'Lien de confirmation invalide ou expiré'
          }
        } catch (error) {
          console.error('Email confirmation error:', error)
          resendError.value = 'Erreur lors de la confirmation'
        }
      }
    }

    /**
     * Component lifecycle
     */
    onMounted(() => {
      // Start initial countdown
      startCountdown()

      // Handle confirmation token if present
      handleConfirmationToken()

      // Store email in localStorage for persistence
      if (userEmail.value) {
        localStorage.setItem('pendingConfirmationEmail', userEmail.value)
      }
    })

    onUnmounted(() => {
      // Clean up countdown interval
      if (countdownInterval.value) {
        clearInterval(countdownInterval.value)
      }
    })

    return {
      userEmail,
      isResending,
      resendSuccess,
      resendError,
      resendCountdown,
      resendConfirmation,
      goBack
    }
  }
}
</script>

<style scoped>
.confirmation-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
  background-color: var(--color-gray-50);
}

.confirmation-card {
  max-width: 500px;
  width: 100%;
  background-color: var(--color-white);
  border-radius: var(--radius-form);
  box-shadow: var(--shadow-lg);
  padding: var(--space-8);
  text-align: center;
}

.icon-container {
  margin-bottom: var(--space-6);
}

.icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  background-color: #F0FDF4;
  border: 3px solid var(--color-success);
}

.confirmation-content {
  margin-bottom: var(--space-8);
}

.title {
  margin: 0 0 var(--space-4) 0;
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-black);
}

.description {
  margin: 0 0 var(--space-3) 0;
  color: var(--color-gray-600);
  font-size: var(--font-size-base);
}

.email-display {
  padding: var(--space-3);
  background-color: var(--color-gray-100);
  border-radius: var(--radius-form);
  font-family: 'Courier New', monospace;
  font-weight: var(--font-weight-medium);
  color: var(--color-blue);
  margin-bottom: var(--space-4);
  word-break: break-all;
}

.instructions {
  margin: 0 0 var(--space-6) 0;
  color: var(--color-gray-700);
  line-height: var(--line-height-relaxed);
}

.countdown {
  margin-bottom: var(--space-4);
  padding: var(--space-3);
  background-color: var(--color-gray-100);
  border-radius: var(--radius-form);
  color: var(--color-gray-600);
  font-size: var(--font-size-sm);
}

.resend-button {
  padding: var(--space-3) var(--space-6);
  background-color: var(--color-blue);
  color: var(--color-white);
  border: none;
  border-radius: var(--radius-button);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: background-color var(--transition-fast);
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
}

.resend-button:hover:not(:disabled) {
  background-color: var(--color-blue-hover);
}

.resend-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.resend-button:focus {
  outline: 2px solid var(--color-blue);
  outline-offset: 2px;
}

.button-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid var(--color-white);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.success-message {
  margin-top: var(--space-3);
  padding: var(--space-3);
  background-color: #F0FDF4;
  border: 1px solid var(--color-success);
  border-radius: var(--radius-form);
  color: var(--color-success);
  font-size: var(--font-size-sm);
}

.error-message {
  margin-top: var(--space-3);
  padding: var(--space-3);
  background-color: #FEF2F2;
  border: 1px solid var(--color-error);
  border-radius: var(--radius-form);
  color: var(--color-error);
  font-size: var(--font-size-sm);
}

.confirmation-actions {
  border-top: 1px solid var(--color-gray-200);
  padding-top: var(--space-6);
  margin-bottom: var(--space-6);
}

.help-text {
  margin: 0 0 var(--space-4) 0;
  color: var(--color-gray-600);
  font-size: var(--font-size-sm);
}

.action-buttons {
  display: flex;
  gap: var(--space-3);
  justify-content: center;
  flex-wrap: wrap;
}

.secondary-button {
  padding: var(--space-3) var(--space-4);
  background-color: transparent;
  color: var(--color-gray-600);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--radius-button);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  text-decoration: none;
  display: inline-block;
}

.secondary-button:hover {
  background-color: var(--color-gray-50);
  border-color: var(--color-gray-400);
}

.primary-button {
  padding: var(--space-3) var(--space-4);
  background-color: var(--color-blue);
  color: var(--color-white);
  border: none;
  border-radius: var(--radius-button);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: background-color var(--transition-fast);
  text-decoration: none;
  display: inline-block;
}

.primary-button:hover {
  background-color: var(--color-blue-hover);
}

.help-section {
  border-top: 1px solid var(--color-gray-200);
  padding-top: var(--space-6);
}

.help-details {
  text-align: left;
}

.help-summary {
  font-weight: var(--font-weight-medium);
  color: var(--color-gray-700);
  cursor: pointer;
  padding: var(--space-2);
  border-radius: var(--radius-form);
  transition: background-color var(--transition-fast);
  list-style: none;
  text-align: center;
}

.help-summary:hover {
  background-color: var(--color-gray-50);
}

.help-content {
  padding: var(--space-4) 0 var(--space-2) 0;
}

.help-list {
  margin: 0 0 var(--space-4) 0;
  padding-left: var(--space-5);
  color: var(--color-gray-600);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-relaxed);
}

.help-list li {
  margin-bottom: var(--space-2);
}

.contact-link {
  color: var(--color-blue);
  text-decoration: none;
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-sm);
  transition: color var(--transition-fast);
}

.contact-link:hover {
  color: var(--color-blue-hover);
  text-decoration: underline;
}

/* Mobile responsiveness */
@media (max-width: 480px) {
  .confirmation-card {
    padding: var(--space-6);
    margin: var(--space-2);
  }

  .action-buttons {
    flex-direction: column;
  }

  .icon {
    width: 60px;
    height: 60px;
    font-size: 2rem;
  }

  .title {
    font-size: var(--font-size-2xl);
  }
}
</style>
