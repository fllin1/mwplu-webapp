<template>
  <form @submit.prevent="handleSubmit" class="signup-form">
    <div class="form-header">
      <h2>Créer un compte</h2>
      <p>Rejoignez la communauté MWPLU</p>
    </div>

    <!-- Name Field -->
    <div class="form-group">
      <label for="name" class="form-label">
        Nom complet
        <span class="required">*</span>
      </label>
      <input
        id="name"
        v-model="form.name"
        type="text"
        class="form-input"
        :class="{ 'error': errors.name }"
        placeholder="Prénom Nom"
        required
        autocomplete="name"
        @blur="validateName"
        @input="clearFieldError('name')"
      />
      <span v-if="errors.name" class="error-message">
        {{ errors.name }}
      </span>
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
          placeholder="Créez un mot de passe sécurisé"
          required
          autocomplete="new-password"
          @blur="validatePassword"
          @input="onPasswordInput"
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

      <!-- Password Strength Indicator -->
      <div v-if="form.password" class="password-strength">
        <div class="strength-meter">
          <div
            class="strength-fill"
            :class="passwordStrength.class"
            :style="{ width: passwordStrength.width }"
          ></div>
        </div>
        <span class="strength-text" :class="passwordStrength.class">
          {{ passwordStrength.text }}
        </span>
      </div>

      <span v-if="errors.password" class="error-message">
        {{ errors.password }}
      </span>

      <!-- Password Requirements -->
      <div class="password-requirements">
        <p class="requirements-title">Votre mot de passe doit contenir :</p>
        <ul class="requirements-list">
          <li :class="{ 'met': passwordChecks.length }">
            Au moins 8 caractères
          </li>
          <li :class="{ 'met': passwordChecks.uppercase }">
            Une lettre majuscule
          </li>
          <li :class="{ 'met': passwordChecks.lowercase }">
            Une lettre minuscule
          </li>
          <li :class="{ 'met': passwordChecks.number }">
            Un chiffre
          </li>
          <li :class="{ 'met': passwordChecks.special }">
            Un caractère spécial (!@#$%^&*)
          </li>
        </ul>
      </div>
    </div>

    <!-- Confirm Password Field -->
    <div class="form-group">
      <label for="confirmPassword" class="form-label">
        Confirmer le mot de passe
        <span class="required">*</span>
      </label>
      <input
        id="confirmPassword"
        v-model="form.confirmPassword"
        type="password"
        class="form-input"
        :class="{ 'error': errors.confirmPassword }"
        placeholder="Répétez votre mot de passe"
        required
        autocomplete="new-password"
        @blur="validateConfirmPassword"
        @input="clearFieldError('confirmPassword')"
      />
      <span v-if="errors.confirmPassword" class="error-message">
        {{ errors.confirmPassword }}
      </span>
    </div>

    <!-- Terms and Privacy -->
    <div class="form-group">
      <label class="checkbox-container">
        <input
          v-model="form.acceptTerms"
          type="checkbox"
          class="checkbox"
          required
          @change="clearFieldError('acceptTerms')"
        />
        <span class="checkmark"></span>
        <span class="checkbox-label">
          J'accepte les
          <a href="/terms" target="_blank" class="link">conditions d'utilisation</a>
          et la
          <a href="/privacy" target="_blank" class="link">politique de confidentialité</a>
        </span>
      </label>
      <span v-if="errors.acceptTerms" class="error-message">
        {{ errors.acceptTerms }}
      </span>
    </div>

    <!-- Newsletter Subscription (Optional) -->
    <div class="form-group">
      <label class="checkbox-container">
        <input
          v-model="form.subscribeNewsletter"
          type="checkbox"
          class="checkbox"
        />
        <span class="checkmark"></span>
        <span class="checkbox-label">
          Recevoir les actualités et nouveautés MWPLU par e-mail
        </span>
      </label>
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

    <!-- Success Message -->
    <div v-if="successMessage" class="success-message">
      {{ successMessage }}
    </div>

    <!-- Submit Button -->
    <button
      type="submit"
      class="submit-button"
      :disabled="!canSubmit"
      :class="{ 'loading': isLoading }"
    >
      <span v-if="isLoading" class="button-spinner"></span>
      <span v-else>Créer mon compte</span>
    </button>

    <!-- Login Link -->
    <div class="form-footer">
      <p>
        Déjà un compte ?
        <router-link to="/login" class="login-link">
          Se connecter
        </router-link>
      </p>
    </div>
  </form>
</template>

<script>
/**
 * SignupForm Component
 * @description Complete signup form with enhanced validation and security
 *
 * Key Features:
 * - Real-time password strength validation
 * - Visual password requirements checklist
 * - Email format validation
 * - Terms acceptance requirement
 * - CAPTCHA integration
 * - Newsletter opt-in
 *
 * Password Security:
 * - Minimum 8 characters
 * - Must contain uppercase, lowercase, number, special character
 * - Real-time strength indicator
 * - Confirmation field for typo prevention
 *
 * UX Improvements:
 * - Clear error messages in French
 * - Real-time validation feedback
 * - Visual progress indicators
 * - Accessible form labels and ARIA attributes
 */
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import TurnstileWidget from './TurnstileWidget.vue'

export default {
  name: 'SignupForm',

  components: {
    TurnstileWidget
  },

  emits: ['success'],

  setup(props, { emit }) {
    const router = useRouter()
    const authStore = useAuthStore()

    // Form data
    const form = reactive({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
      subscribeNewsletter: false
    })

    // Validation and UI state
    const errors = reactive({})
    const globalError = ref('')
    const successMessage = ref('')
    const showPassword = ref(false)
    const showCaptcha = ref(true)
    const captchaToken = ref('')
    const isLoading = ref(false)

    // Environment variables
    const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY || ''

    /**
     * Password strength analysis
     * Provides real-time feedback on password quality
     */
    const passwordChecks = computed(() => {
      const password = form.password
      return {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /\d/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
      }
    })

    const passwordStrength = computed(() => {
      const checks = passwordChecks.value
      const score = Object.values(checks).filter(Boolean).length

      if (score < 2) {
        return { width: '20%', class: 'weak', text: 'Très faible' }
      } else if (score < 3) {
        return { width: '40%', class: 'weak', text: 'Faible' }
      } else if (score < 4) {
        return { width: '60%', class: 'medium', text: 'Moyen' }
      } else if (score < 5) {
        return { width: '80%', class: 'good', text: 'Bon' }
      } else {
        return { width: '100%', class: 'strong', text: 'Très fort' }
      }
    })

    /**
     * Form validation methods
     */
    const validateName = () => {
      const name = form.name.trim()
      if (!name) {
        errors.name = 'Le nom est requis'
        return false
      }
      if (name.length < 2) {
        errors.name = 'Le nom doit contenir au moins 2 caractères'
        return false
      }
      if (name.length > 50) {
        errors.name = 'Le nom ne peut pas dépasser 50 caractères'
        return false
      }
      if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(name)) {
        errors.name = 'Le nom ne peut contenir que des lettres, espaces, apostrophes et tirets'
        return false
      }
      delete errors.name
      return true
    }

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

    const validatePassword = () => {
      const password = form.password
      if (!password) {
        errors.password = 'Le mot de passe est requis'
        return false
      }

      const checks = passwordChecks.value
      if (!checks.length) {
        errors.password = 'Le mot de passe doit contenir au moins 8 caractères'
        return false
      }
      if (!checks.uppercase) {
        errors.password = 'Le mot de passe doit contenir au moins une majuscule'
        return false
      }
      if (!checks.lowercase) {
        errors.password = 'Le mot de passe doit contenir au moins une minuscule'
        return false
      }
      if (!checks.number) {
        errors.password = 'Le mot de passe doit contenir au moins un chiffre'
        return false
      }
      if (!checks.special) {
        errors.password = 'Le mot de passe doit contenir au moins un caractère spécial'
        return false
      }

      delete errors.password
      return true
    }

    const validateConfirmPassword = () => {
      if (!form.confirmPassword) {
        errors.confirmPassword = 'Veuillez confirmer votre mot de passe'
        return false
      }
      if (form.password !== form.confirmPassword) {
        errors.confirmPassword = 'Les mots de passe ne correspondent pas'
        return false
      }
      delete errors.confirmPassword
      return true
    }

    const validateTerms = () => {
      if (!form.acceptTerms) {
        errors.acceptTerms = 'Vous devez accepter les conditions d\'utilisation'
        return false
      }
      delete errors.acceptTerms
      return true
    }

    /**
     * Event handlers
     */
    const clearFieldError = (field) => {
      delete errors[field]
      if (globalError.value) {
        globalError.value = ''
      }
    }

    const onPasswordInput = () => {
      clearFieldError('password')
      if (form.confirmPassword) {
        validateConfirmPassword()
      }
    }

    const togglePasswordVisibility = () => {
      showPassword.value = !showPassword.value
    }

    /**
     * Form submission validation
     */
    const canSubmit = computed(() => {
      return validateName() &&
             validateEmail() &&
             validatePassword() &&
             validateConfirmPassword() &&
             validateTerms() &&
             captchaToken.value &&
             !isLoading.value
    })

    /**
     * CAPTCHA handlers
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
     * Form submission
     */
    const handleSubmit = async () => {
      if (!validateName() || !validateEmail() || !validatePassword() ||
          !validateConfirmPassword() || !validateTerms()) {
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
        successMessage.value = ''

        const result = await authStore.signup(
          form.email,
          form.password,
          form.name
        )

        if (result.success) {
          if (result.needsConfirmation) {
            successMessage.value = result.message
            form.password = ''
            form.confirmPassword = ''
            form.name = ''
            captchaToken.value = ''
          } else {
            emit('success', { user: result.user })
            await router.push('/dashboard')
          }
        } else {
          globalError.value = result.error || 'Échec de la création du compte'
          captchaToken.value = ''
        }

      } catch (error) {
        console.error('Signup submission error:', error)
        globalError.value = 'Une erreur inattendue s\'est produite'
      } finally {
        isLoading.value = false
      }
    }

    /**
     * Component initialization
     */
    onMounted(() => {
      authStore.clearError()

      const nameInput = document.getElementById('name')
      if (nameInput) {
        nameInput.focus()
      }
    })

    return {
      form,
      errors,
      globalError,
      successMessage,
      showPassword,
      showCaptcha,
      captchaToken,
      isLoading,
      turnstileSiteKey,
      passwordChecks,
      passwordStrength,
      canSubmit,
      validateName,
      validateEmail,
      validatePassword,
      validateConfirmPassword,
      clearFieldError,
      onPasswordInput,
      togglePasswordVisibility,
      onCaptchaVerified,
      onCaptchaError,
      onCaptchaExpired,
      handleSubmit
    }
  }
}
</script>

<style scoped>
.signup-form {
  max-width: 450px;
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

.password-strength {
  margin-top: var(--space-2);
}

.strength-meter {
  width: 100%;
  height: 4px;
  background-color: var(--color-gray-200);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: var(--space-1);
}

.strength-fill {
  height: 100%;
  transition: width var(--transition-base);
}

.strength-fill.weak {
  background-color: var(--color-error);
}

.strength-fill.medium {
  background-color: #F59E0B;
}

.strength-fill.good {
  background-color: #10B981;
}

.strength-fill.strong {
  background-color: var(--color-success);
}

.strength-text {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.strength-text.weak {
  color: var(--color-error);
}

.strength-text.medium {
  color: #F59E0B;
}

.strength-text.good,
.strength-text.strong {
  color: var(--color-success);
}

.password-requirements {
  margin-top: var(--space-3);
  padding: var(--space-3);
  background-color: var(--color-gray-50);
  border-radius: var(--radius-form);
}

.requirements-title {
  margin: 0 0 var(--space-2) 0;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-gray-700);
}

.requirements-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.requirements-list li {
  font-size: var(--font-size-xs);
  color: var(--color-gray-600);
  margin-bottom: var(--space-1);
  position: relative;
  padding-left: var(--space-5);
}

.requirements-list li::before {
  content: '✗';
  position: absolute;
  left: 0;
  color: var(--color-error);
  font-weight: var(--font-weight-bold);
}

.requirements-list li.met {
  color: var(--color-success);
}

.requirements-list li.met::before {
  content: '✓';
  color: var(--color-success);
}

.error-message {
  display: block;
  margin-top: var(--space-1);
  font-size: var(--font-size-xs);
  color: var(--color-error);
}

.checkbox-container {
  display: flex;
  align-items: flex-start;
  cursor: pointer;
  line-height: var(--line-height-normal);
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
  margin-top: 2px;
  position: relative;
  flex-shrink: 0;
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
  font-size: var(--font-size-sm);
}

.link {
  color: var(--color-blue);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.link:hover {
  color: var(--color-blue-hover);
  text-decoration: underline;
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

.success-message {
  margin-bottom: var(--space-4);
  padding: var(--space-3);
  background-color: #F0FDF4;
  border: 1px solid var(--color-success);
  border-radius: var(--radius-form);
  color: var(--color-success);
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

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.form-footer {
  margin-top: var(--space-6);
  text-align: center;
  font-size: var(--font-size-sm);
  color: var(--color-gray-600);
}

.login-link {
  color: var(--color-blue);
  text-decoration: none;
  font-weight: var(--font-weight-medium);
  transition: color var(--transition-fast);
}

.login-link:hover {
  color: var(--color-blue-hover);
  text-decoration: underline;
}

/* Mobile responsiveness */
@media (max-width: 480px) {
  .signup-form {
    padding: var(--space-6);
    margin: var(--space-4);
  }
}
</style>
