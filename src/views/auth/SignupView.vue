<template>
  <AppLayout :show-container="false" :padded="false" full-height>
    <div class="auth-page-wrapper">
      <div class="auth-container card">
        <!-- Header -->
        <div class="auth-header">
          <h2 class="auth-title">Créer un compte</h2>
          <p class="auth-subtitle">
            Rejoignez MWPLU pour accéder aux synthèses PLU
          </p>
        </div>

        <!-- Main signup content with two-column layout -->
        <div class="signup-content-wrapper">
          <!-- Left side: Main form -->
          <div class="main-form-container">
            <form @submit.prevent="handleSubmit" class="signup-form-inner">
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

              <!-- Phone Number Field (Optional) -->
              <div class="form-group">
                <label for="phone" class="form-label">
                  Numéro de téléphone
                  <span class="optional">(optionnel)</span>
                </label>
                <input
                  id="phone"
                  v-model="form.phone"
                  type="tel"
                  class="form-input"
                  :class="{ 'error': errors.phone }"
                  placeholder="+33 1 23 45 67 89"
                  autocomplete="tel"
                  @blur="validatePhone"
                  @input="clearFieldError('phone')"
                />
                <span v-if="errors.phone" class="error-message">
                  {{ errors.phone }}
                </span>
                <span class="form-hint">Format recommandé : +33 1 23 45 67 89</span>
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

                <!-- Password Requirements -->
                <div class="password-requirements-condensed">
                  <ul class="requirements-list">
                    <li :class="{ 'met': passwordChecks.length }">8+ caractères</li>
                    <li :class="{ 'met': passwordChecks.uppercase }">1 majuscule</li>
                    <li :class="{ 'met': passwordChecks.lowercase }">1 minuscule</li>
                    <li :class="{ 'met': passwordChecks.number }">1 chiffre</li>
                  </ul>
                </div>
                <span v-if="errors.password" class="error-message">
                  {{ errors.password }}
                </span>
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
                    <button type="button" @click.prevent="showPolicy('terms')" class="link-button">conditions d'utilisation</button>
                  </span>
                </label>
                <span v-if="errors.acceptTerms" class="error-message">
                  {{ errors.acceptTerms }}
                </span>
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
            </form>
          </div>

          <!-- Vertical Divider -->
          <div class="vertical-divider-container"></div>

          <!-- Right side: Social logins and links -->
          <div class="social-login-container">
            <div class="social-buttons-stack">
              <button
                type="button"
                @click="handleGoogleSignUp"
                class="social-button google-button"
                :disabled="isLoading"
              >
                <img src="@/assets/icons/socials/google.svg" alt="Google" class="social-icon" />
                <span>Continuer avec Google</span>
              </button>
              <button type="button" class="social-button apple-button" disabled>
                <img src="@/assets/icons/socials/apple.svg" alt="Apple" class="social-icon" />
                <span>Continuer avec Apple</span>
              </button>
              <button type="button" class="social-button facebook-button" disabled>
                <img src="@/assets/icons/socials/facebook.svg" alt="Facebook" class="social-icon" />
                <span>Continuer avec Facebook</span>
              </button>
              <button type="button" class="social-button linkedin-button" disabled>
                <img src="@/assets/icons/socials/linkedin.svg" alt="LinkedIn" class="social-icon" />
                <span>Continuer avec LinkedIn</span>
              </button>
            </div>
            <div class="auth-navigation-links">
              <p class="nav-text">
                Déjà un compte ?
                <router-link to="/login" class="nav-link">
                  Se connecter
                </router-link>
              </p>
              <p class="footer-text">
                <br>
                En créant un compte, vous acceptez nos
                <router-link to="/policies/terms" class="footer-link">
                  conditions d'utilisation
                </router-link>
                et notre
                <router-link to="/policies/privacy" class="footer-link">
                  politique de confidentialité
                </router-link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>

  <!-- Policy Modal -->
  <PolicyModal
    :visible="isModalVisible"
    :title="modalTitle"
    :content="modalContent"
    @close="closeModal"
  />
</template>

<script>
/**
 * SignupView Component
 * @description Complete signup page with enhanced validation and security
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
import AppLayout from '@/components/layout/AppLayout.vue'
import TurnstileWidget from '@/components/common/TurnstileWidget.vue'
import PolicyModal from '@/components/common/PolicyModal.vue'

export default {
  name: 'SignupView',

  components: {
    AppLayout,
    TurnstileWidget,
    PolicyModal,
  },

  emits: ['success'],

  setup(props, { emit }) {
    const router = useRouter()
    const authStore = useAuthStore()

    // Form data
    const form = reactive({
      name: '',
      email: '',
      phone: '',
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

    // Modal state
    const isModalVisible = ref(false)
    const modalTitle = ref('')
    const modalContent = ref('')
    const modalIsLoading = ref(false)

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
        number: /\d/.test(password)
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

    const validatePhone = () => {
      const phone = form.phone.trim()

      // Phone is optional, so empty is valid
      if (!phone) {
        delete errors.phone
        return true
      }

      // French phone number patterns
      const frenchPhonePattern = /^(?:\+33|0)[1-9](?:[. -]?\d{2}){4}$/
      const internationalPhonePattern = /^\+\d{1,3}[. -]?\d{1,14}$/

      if (!frenchPhonePattern.test(phone) && !internationalPhonePattern.test(phone)) {
        errors.phone = 'Format de téléphone invalide'
        return false
      }

      if (phone.length > 20) {
        errors.phone = 'Le numéro de téléphone est trop long'
        return false
      }

      delete errors.phone
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
             validatePhone() &&
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
      if (!validateName() || !validateEmail() || !validatePhone() ||
          !validatePassword() || !validateConfirmPassword() || !validateTerms()) {
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

            // Navigate to confirmation page
            await router.push({
              name: 'confirmation',
              query: { email: form.email }
            })
          } else {
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
     * Handle Google sign-up
     */
    const handleGoogleSignUp = async () => {
      try {
        isLoading.value = true
        globalError.value = ''

        const result = await authStore.signUpWithGoogle()

        if (result.success) {
          // Google OAuth redirects automatically
          emit('success', { provider: 'google' })
        } else {
          globalError.value = result.error || 'Échec de l\'inscription avec Google'
        }
      } catch (error) {
        console.error('Google sign-up error:', error)
        globalError.value = 'Une erreur inattendue s\'est produite avec Google'
      } finally {
        isLoading.value = false
      }
    }

    const showPolicy = async (policy) => {
      isModalVisible.value = true
      modalIsLoading.value = true

      const policyMap = {
        terms: {
          url: '/policies/terms',
          title: "Conditions Générales d'Utilisation",
        },
        privacy: {
          url: '/policies/privacy',
          title: 'Politique de confidentialité',
        },
      }

      const selectedPolicy = policyMap[policy]
      if (!selectedPolicy) return

      modalTitle.value = selectedPolicy.title
      modalContent.value = '<p>Chargement...</p>'

      try {
        const response = await fetch(selectedPolicy.url)
        const html = await response.text()
        const parser = new DOMParser()
        const doc = parser.parseFromString(html, 'text/html')
        const contentNode = doc.querySelector('.policy-container')

        if (contentNode) {
          modalContent.value = contentNode.innerHTML
        } else {
          modalContent.value = '<p>Le contenu n\'a pas pu être chargé.</p>'
        }
      } catch (error) {
        console.error('Error fetching policy:', error)
        modalContent.value = '<p>Une erreur est survenue lors du chargement du contenu.</p>'
      } finally {
        modalIsLoading.value = false
      }
    }

    const closeModal = () => {
      isModalVisible.value = false
      modalTitle.value = ''
      modalContent.value = ''
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
      validatePhone,
      validatePassword,
      validateConfirmPassword,
      clearFieldError,
      onPasswordInput,
      togglePasswordVisibility,
      onCaptchaVerified,
      onCaptchaError,
      onCaptchaExpired,
      handleSubmit,
      handleGoogleSignUp,
      isModalVisible,
      modalTitle,
      modalContent,
      showPolicy,
      closeModal,
    }
  }
}
</script>

<style scoped>
.auth-page-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  /* background-color: var(--color-gray-50); */
  padding: var(--space-8) var(--space-4);
}

.auth-container {
  width: 100%;
  max-width: 860px;
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  padding: var(--space-8);
  border-radius: var(--radius-card);
  background-color: var(--color-white);
  box-shadow: var(--shadow-md);
}

/* Header */
.auth-header {
  text-align: center;
}

.brand-logo {
  margin-bottom: var(--space-4);
}

.logo-text {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-extrabold);
  color: var(--color-color-black);
  letter-spacing: -0.02em;
  margin: 0;
}

.auth-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-color-black);
  margin: var(--space-4) 0 var(--space-2) 0;
}

.auth-subtitle {
  font-size: var(--font-size-md);
  color: var(--color-gray-700);
  margin: 0;
  line-height: 1.5;
}

/* --- New two-column layout styles --- */
.signup-content-wrapper {
  display: flex;
  justify-content: center;
  gap: var(--space-8);
}

.main-form-container {
  flex: 1;
  max-width: 400px;
  min-width: 0; /* Prevents flexbox overflow */
}

.social-login-container {
  flex: 1;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: var(--space-6);
}

.vertical-divider-container {
  width: 1px;
  background-color: var(--color-gray-200);
  margin: 0 var(--space-4);
}

.social-buttons-stack {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  width: 100%;
}

.social-button {
  width: 100%;
  padding: var(--space-3);
  background-color: var(--color-white);
  color: var(--color-gray-700);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--radius-button);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
}

.social-button:hover:not(:disabled) {
  background-color: var(--color-gray-50);
  border-color: var(--color-gray-400);
  box-shadow: var(--shadow-sm);
}

.social-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.social-icon {
  width: 18px;
  height: 18px;
}
/* --- End new layout styles --- */

/* Form Container - REMOVED, REPLACED BY NEW LAYOUT */
.auth-form-section {
  display: none; /* Hide old container */
}

.signup-form-inner {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.form-group {
  margin-bottom: 0;
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

.optional {
  color: var(--color-gray-500);
  font-weight: var(--font-weight-normal);
}

.form-hint {
  display: block;
  margin-top: var(--space-1);
  font-size: var(--font-size-xs);
  color: var(--color-gray-500);
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

.password-requirements-condensed {
  margin-top: var(--space-2);
}

.password-requirements-condensed .requirements-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
  margin: 0;
  padding: 0;
  list-style: none;
}

.password-requirements-condensed .requirements-list li {
  font-size: var(--font-size-xxs);
  color: var(--color-gray-600);
  position: relative;
  padding-left: 16px;
}

.password-requirements-condensed .requirements-list li::before {
  content: '✗';
  position: absolute;
  left: 0;
  color: var(--color-error);
  font-weight: var(--font-weight-bold);
}

.password-requirements-condensed .requirements-list li.met {
  color: var(--color-success);
}

.password-requirements-condensed .requirements-list li.met::before {
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

.link-button {
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  color: var(--color-blue);
  text-decoration: underline;
  cursor: pointer;
}

.link-button:hover {
  color: var(--color-blue-hover);
}

.global-error {
  margin-bottom: var(--space-4);
  padding: var(--space-3);
  background-color: var(--color-error-bg);
  border: 1px solid var(--color-error-border);
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
  background-color: var(--color-black);
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

.auth-navigation-links {
  text-align: center;
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-gray-200);
}

.nav-text {
  font-size: var(--font-size-sm);
  color: var(--color-gray-600);
  margin: 0;
}

.nav-link {
  color: var(--color-blue);
  text-decoration: none;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  transition: color var(--transition-fast);
}

.nav-link:hover {
  color: var(--color-blue-dark);
  text-decoration: underline;
}

.nav-link:focus {
  outline: 2px solid var(--color-blue);
  outline-offset: 2px;
  border-radius: var(--radius-button);
}

/* Footer */
.auth-footer {
  text-align: center;
}

.footer-text {
  font-size: var(--font-size-sm);
  color: var(--color-black);
  margin: 0;
  line-height: 1.6;
}

.footer-link {
  color: var(--color-blue);
  text-decoration: none;
  font-weight: var(--font-weight-medium);
  transition: color var(--transition-fast);
}

.footer-link:hover {
  color: var(--color-blue-dark);
}

/* Mobile responsiveness */
@media (max-width: 640px) {
  .auth-page-wrapper {
    padding: var(--space-4);
  }

  .auth-container {
    padding: var(--space-6);
    gap: var(--space-6);
  }

  .logo-text {
    font-size: var(--font-size-2xl);
  }

  .auth-title {
    font-size: var(--font-size-xl);
    margin-top: var(--space-3);
  }

  .auth-subtitle {
    font-size: var(--font-size-sm);
  }

  .auth-navigation-links {
    margin-top: 0;
    padding-top: var(--space-3);
  }

  .signup-content-wrapper {
    flex-direction: column;
  }

  .social-login-container {
    flex-basis: auto;
    margin-top: var(--space-6);
  }

  .vertical-divider-container {
    flex-direction: row;
  }
  .vertical-divider-container::before,
  .vertical-divider-container::after {
    height: 1px;
    width: auto;
  }
}

@media (max-width: 480px) {
  .auth-container {
    padding: var(--space-4);
  }
}
</style>
