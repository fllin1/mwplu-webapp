<template>
  <form @submit.prevent="handleSubmit" class="login-form">
    <div class="form-header">
      <h2>Connexion</h2>
      <p>Accédez à votre compte MWPLU</p>
    </div>

    <!-- Email Field -->
    <div class="form-group">
      <label for="email" class="form-label">
        Adresse e-mail
        <span class="required">*</span>
      </label>
      <input
        id="email"
        v-model="form.email"
        type="email"
        class="form-input"
        :class="{ 'error': errors.email }"
        placeholder="votre@email.com"
        required
        autocomplete="email"
        @blur="validateEmail"
        @input="clearFieldError('email')"
      />
      <span v-if="errors.email" class="error-message">
        {{ errors.email }}
      </span>
    </div>

    <!-- Password Field -->
    <div class="form-group">
      <label for="password" class="form-label">
        Mot de passe
        <span class="required">*</span>
      </label>
      <div class="password-input-container">
        <input
          id="password"
          v-model="form.password"
          :type="showPassword ? 'text' : 'password'"
          class="form-input password-input"
          :class="{ 'error': errors.password }"
          placeholder="Votre mot de passe"
          required
          autocomplete="current-password"
          @blur="validatePassword"
          @input="clearFieldError('password')"
        />
        <button
          type="button"
          @click="togglePasswordVisibility"
          class="password-toggle"
          :aria-label="showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
        >
          {{ showPassword ? '👁️' : '👁️‍🗨️' }}
        </button>
      </div>
      <span v-if="errors.password" class="error-message">
        {{ errors.password }}
      </span>
    </div>

    <!-- Remember Me & Forgot Password -->
    <div class="form-options">
      <label class="checkbox-container">
        <input
          v-model="form.rememberMe"
          type="checkbox"
          class="checkbox"
        />
        <span class="checkmark"></span>
        <span class="checkbox-label">Se souvenir de moi</span>
      </label>

      <button
        type="button"
        @click="handleForgotPassword"
        class="forgot-password-link"
      >
        Mot de passe oublié ?
      </button>
    </div>

    <!-- Turnstile CAPTCHA -->
    <TurnstileWidget
      v-if="showCaptcha"
      :site-key="turnstileSiteKey"
      @verified="onCaptchaVerified"
      @error="onCaptchaError"
      @expired="onCaptchaExpired"
    />

    <!-- Global Error Message -->
    <div v-if="globalError" class="global-error">
      {{ globalError }}
    </div>

    <!-- Submit Button -->
    <button
      type="submit"
      class="submit-button"
      :disabled="!canSubmit"
      :class="{ 'loading': isLoading }"
    >
      <span v-if="isLoading" class="button-spinner"></span>
      <span v-else>Se connecter</span>
    </button>

    <!-- Sign Up Link -->
    <div class="form-footer">
      <p>
        Pas encore de compte ?
        <router-link to="/signup" class="signup-link">
          Créer un compte
        </router-link>
      </p>
    </div>
  </form>
</template>

<script>
/**
 * LoginForm Component
 * @description Complete login form with validation, CAPTCHA, and auth integration
 *
 * Why this pattern:
 * - Separates form logic from page layout
 * - Reusable across different login contexts
 * - Handles all validation and error states
 * - Integrates with Pinia auth store
 *
 * Form Validation Strategy:
 * - Real-time validation on blur for better UX
 * - Clear errors on input to avoid frustration
 * - Global error handling for auth failures
 * - CAPTCHA integration for security
 *
 * Communication:
 * - Uses Pinia auth store for login logic
 * - Emits 'success' event when login completes
 * - Router navigation handled by parent component
 */
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import TurnstileWidget from './TurnstileWidget.vue'

export default {
  name: 'LoginForm',

  components: {
    TurnstileWidget
  },

  // Events emitted to parent components
  emits: ['success', 'forgotPassword'],

  setup(props, { emit }) {
    const router = useRouter()
    const authStore = useAuthStore()

    // Form data - reactive for two-way binding
    const form = reactive({
      email: '',
      password: '',
      rememberMe: false
    })

    // Validation and UI state
    const errors = reactive({})
    const globalError = ref('')
    const showPassword = ref(false)
    const showCaptcha = ref(true) // Always show for security
    const captchaToken = ref('')
    const isLoading = ref(false)

    // Environment variables
    const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY || ''

    /**
     * Email validation
     * Uses HTML5 email pattern + additional checks
     */
    const validateEmail = () => {
      const email = form.email.trim()
      if (!email) {
        errors.email = 'L\'adresse e-mail est requise'
        return false
      }

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailPattern.test(email)) {
        errors.email = 'Format d\'e-mail invalide'
        return false
      }

      if (email.length > 254) {
        errors.email = 'L\'adresse e-mail est trop longue'
        return false
      }

      delete errors.email
      return true
    }

    /**
     * Password validation
     * Basic validation for login (not as strict as signup)
     */
    const validatePassword = () => {
      const password = form.password
      if (!password) {
        errors.password = 'Le mot de passe est requis'
        return false
      }

      if (password.length < 6) {
        errors.password = 'Le mot de passe doit contenir au moins 6 caractères'
        return false
      }

      delete errors.password
      return true
    }

    /**
     * Clear specific field error
     * Called when user starts typing to remove error state
     */
    const clearFieldError = (field) => {
      delete errors[field]
      if (globalError.value) {
        globalError.value = ''
      }
    }

    /**
     * Toggle password visibility
     * Improves UX by letting users see what they're typing
     */
    const togglePasswordVisibility = () => {
      showPassword.value = !showPassword.value
    }

    /**
     * Check if form can be submitted
     * All validation must pass + CAPTCHA verified
     */
    const canSubmit = computed(() => {
      return validateEmail() &&
             validatePassword() &&
             captchaToken.value &&
             !isLoading.value
    })

    /**
     * CAPTCHA event handlers
     */
    const onCaptchaVerified = (token) => {
      captchaToken.value = token
      globalError.value = ''
    }

    const onCaptchaError = (error) => {
      captchaToken.value = ''
      globalError.value = `Erreur de vérification: ${error}`
    }

    const onCaptchaExpired = () => {
      captchaToken.value = ''
      globalError.value = 'La vérification a expiré. Veuillez recommencer.'
    }

    /**
     * Handle forgot password
     * Emits event to parent component
     */
    const handleForgotPassword = () => {
      emit('forgotPassword', form.email)
    }

    /**
     * Handle form submission
     * Main login logic with comprehensive error handling
     */
    const handleSubmit = async () => {
      // Final validation check
      if (!validateEmail() || !validatePassword()) {
        globalError.value = 'Veuillez corriger les erreurs ci-dessus'
        return
      }

      if (!captchaToken.value) {
        globalError.value = 'Veuillez compléter la vérification'
        return
      }

      try {
        isLoading.value = true
        globalError.value = ''

        // Call auth store login method
        const result = await authStore.login(form.email, form.password)

        if (result.success) {
          // Emit success event to parent
          emit('success', {
            user: result.user,
            rememberMe: form.rememberMe
          })

          // Navigate to dashboard or intended route
          const redirect = router.currentRoute.value.query.redirect || '/dashboard'
          await router.push(redirect)
        } else {
          // Handle login failure
          globalError.value = result.error || 'Échec de la connexion'

          // Reset CAPTCHA on failure for security
          captchaToken.value = ''
        }

      } catch (error) {
        console.error('Login submission error:', error)
        globalError.value = 'Une erreur inattendue s\'est produite'
      } finally {
        isLoading.value = false
      }
    }

    /**
     * Initialize component
     * Setup any needed initial state
     */
    onMounted(() => {
      // Clear any existing auth errors
      authStore.clearError()

      // Focus email field for better UX
      const emailInput = document.getElementById('email')
      if (emailInput) {
        emailInput.focus()
      }
    })

    // Expose to template
    return {
      form,
      errors,
      globalError,
      showPassword,
      showCaptcha,
      captchaToken,
      isLoading,
      turnstileSiteKey,
      canSubmit,
      validateEmail,
      validatePassword,
      clearFieldError,
      togglePasswordVisibility,
      onCaptchaVerified,
      onCaptchaError,
      onCaptchaExpired,
      handleForgotPassword,
      handleSubmit
    }
  }
}
</script>

<style scoped>
.login-form {
  max-width: 400px;
  margin: 0 auto;
  padding: var(--space-8);
  background-color: var(--color-white);
  border-radius: var(--radius-form);
  box-shadow: var(--shadow-md);
}

.form-header {
  text-align: center;
  margin-bottom: var(--space-8);
}

.form-header h2 {
  margin: 0 0 var(--space-2) 0;
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-black);
}

.form-header p {
  margin: 0;
  color: var(--color-gray-600);
  font-size: var(--font-size-sm);
}

.form-group {
  margin-bottom: var(--space-6);
}

.form-label {
  display: block;
  margin-bottom: var(--space-2);
  font-weight: var(--font-weight-medium);
  color: var(--color-black);
  font-size: var(--font-size-sm);
}

.required {
  color: var(--color-error);
}

.form-input {
  width: 100%;
  padding: var(--space-3);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--radius-form);
  font-size: var(--font-size-base);
  transition: border-color var(--transition-fast);
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-blue);
  box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.1);
}

.form-input.error {
  border-color: var(--color-error);
}

.password-input-container {
  position: relative;
}

.password-input {
  padding-right: var(--space-10);
}

.password-toggle {
  position: absolute;
  right: var(--space-3);
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: var(--font-size-lg);
  padding: var(--space-1);
  color: var(--color-gray-500);
  transition: color var(--transition-fast);
}

.password-toggle:hover {
  color: var(--color-gray-700);
}

.password-toggle:focus {
  outline: 2px solid var(--color-blue);
  outline-offset: 2px;
  border-radius: 2px;
}

.error-message {
  display: block;
  margin-top: var(--space-1);
  font-size: var(--font-size-xs);
  color: var(--color-error);
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-6);
  font-size: var(--font-size-sm);
}

.checkbox-container {
  display: flex;
  align-items: center;
  cursor: pointer;
  position: relative;
}

.checkbox {
  display: none;
}

.checkmark {
  width: 16px;
  height: 16px;
  border: 1px solid var(--color-gray-400);
  border-radius: 2px;
  margin-right: var(--space-2);
  position: relative;
  transition: all var(--transition-fast);
}

.checkbox:checked + .checkmark {
  background-color: var(--color-blue);
  border-color: var(--color-blue);
}

.checkbox:checked + .checkmark::after {
  content: '✓';
  position: absolute;
  top: -1px;
  left: 2px;
  color: var(--color-white);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
}

.checkbox-label {
  color: var(--color-gray-700);
}

.forgot-password-link {
  background: none;
  border: none;
  color: var(--color-blue);
  cursor: pointer;
  font-size: var(--font-size-sm);
  text-decoration: underline;
  transition: color var(--transition-fast);
}

.forgot-password-link:hover {
  color: var(--color-blue-hover);
}

.forgot-password-link:focus {
  outline: 2px solid var(--color-blue);
  outline-offset: 2px;
  border-radius: 2px;
}

.global-error {
  margin-bottom: var(--space-4);
  padding: var(--space-3);
  background-color: #FEF2F2;
  border: 1px solid var(--color-error);
  border-radius: var(--radius-form);
  color: var(--color-error);
  font-size: var(--font-size-sm);
  text-align: center;
}

.submit-button {
  width: 100%;
  padding: var(--space-4);
  background-color: var(--color-blue);
  color: var(--color-white);
  border: none;
  border-radius: var(--radius-button);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
}

.submit-button:hover:not(:disabled) {
  background-color: var(--color-blue-hover);
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.submit-button:focus {
  outline: 2px solid var(--color-blue);
  outline-offset: 2px;
}

.submit-button.loading {
  opacity: 0.8;
}

.button-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid var(--color-white);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.form-footer {
  margin-top: var(--space-6);
  text-align: center;
  font-size: var(--font-size-sm);
  color: var(--color-gray-600);
}

.signup-link {
  color: var(--color-blue);
  text-decoration: none;
  font-weight: var(--font-weight-medium);
  transition: color var(--transition-fast);
}

.signup-link:hover {
  color: var(--color-blue-hover);
  text-decoration: underline;
}

/* Mobile responsiveness */
@media (max-width: 480px) {
  .login-form {
    padding: var(--space-6);
    margin: var(--space-4);
  }

  .form-options {
    flex-direction: column;
    gap: var(--space-3);
    align-items: flex-start;
  }
}
</style>
