<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <div class="mx-auto h-12 w-12 text-center">
          <h1 class="text-2xl font-bold text-indigo-600">{{ APP_CONSTANTS.APP_NAME }}</h1>
        </div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Access urban planning documents and syntheses
        </p>
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
        <div class="space-y-4">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              autocomplete="email"
              required
              class="mt-1 relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Enter your email"
              :disabled="isLoading"
            />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700"> Password </label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              autocomplete="current-password"
              required
              class="mt-1 relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Enter your password"
              :disabled="isLoading"
            />
          </div>
        </div>

        <!-- Optional Turnstile CAPTCHA Widget - only show if configured -->
        <TurnstileWidget
          v-if="showCaptcha"
          ref="captchaRef"
          :site-key="turnstileSiteKey"
          @verified="onCaptchaVerified"
          @error="onCaptchaError"
        />

        <!-- Error Display -->
        <div v-if="authStore.error" class="rounded-md bg-red-50 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">
                {{ authStore.error }}
              </h3>
            </div>
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="!canSubmit"
            :class="[
              'group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white transition-colors duration-200',
              canSubmit
                ? 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                : 'bg-gray-400 cursor-not-allowed',
            ]"
          >
            <span v-if="isLoading" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            </span>
            {{ isLoading ? 'Signing in...' : 'Sign in' }}
          </button>
        </div>

        <div class="flex items-center justify-between">
          <div class="text-sm">
            <router-link
              to="/reset-password"
              class="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Forgot your password?
            </router-link>
          </div>
          <div class="text-sm">
            <router-link to="/signup" class="font-medium text-indigo-600 hover:text-indigo-500">
              Create account
            </router-link>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useAuth } from '@/composables/useAuth'
import { APP_CONSTANTS } from '@/utils/constants'
import TurnstileWidget from '@/components/common/TurnstileWidget.vue'

// Store and composables
const authStore = useAuthStore()
const { login } = useAuth()

// Refs
const captchaRef = ref(null)

// Reactive data
const form = reactive({
  email: '',
  password: '',
})

const captchaToken = ref(null)

// Configuration
const turnstileSiteKey = APP_CONSTANTS.TURNSTILE.SITE_KEY
const showCaptcha = !!turnstileSiteKey // Only show if configured

// Computed
const isLoading = computed(() => authStore.isLoading)
const canSubmit = computed(() => {
  const hasRequiredFields = form.email && form.password
  const hasCaptchaIfNeeded = !showCaptcha || captchaToken.value
  return hasRequiredFields && hasCaptchaIfNeeded && !isLoading.value
})

// Methods
const onCaptchaVerified = (token) => {
  captchaToken.value = token
  authStore.clearError()
}

const onCaptchaError = () => {
  captchaToken.value = null
}

const handleSubmit = async () => {
  if (!canSubmit.value) return

  // Clear any previous errors
  authStore.clearError()

  try {
    await login(form.email, form.password)

    // Success is handled by the useAuth composable
    // which will redirect and show success message
  } catch (error) {
    console.error('Login error:', error)

    // Reset CAPTCHA on failed login
    if (showCaptcha && captchaRef.value) {
      captchaRef.value.reset()
      captchaToken.value = null
    }
  }
}

// Auto-focus email field on mount
import { onMounted } from 'vue'
onMounted(() => {
  document.getElementById('email')?.focus()
})
</script>

<style scoped>
/* Add any component-specific styles here */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
