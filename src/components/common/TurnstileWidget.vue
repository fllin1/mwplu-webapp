<!-- src/components/common/TurnstileWidget.vue -->
<template>
  <div class="turnstile-container">
    <div ref="turnstileRef" class="turnstile-widget"></div>
    <div v-if="error" class="mt-2 text-sm text-red-600">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useTurnstile } from '@/composables/useTurnstile'

const props = defineProps({
  siteKey: {
    type: String,
    required: true,
  },
  theme: {
    type: String,
    default: 'auto', // 'light', 'dark', 'auto'
  },
  size: {
    type: String,
    default: 'normal', // 'normal', 'compact'
  },
  action: {
    type: String,
    default: 'submit',
  },
  cData: {
    type: String,
    default: undefined,
  },
})

const emit = defineEmits(['verified', 'error', 'expired', 'timeout'])

const turnstileRef = ref(null)
const widgetId = ref(null)
const token = ref(null)
const error = ref(null)

const { isLoaded, loadTurnstile } = useTurnstile()

const initializeTurnstile = async () => {
  try {
    const turnstile = await loadTurnstile()

    if (!turnstileRef.value) return

    widgetId.value = turnstile.render(turnstileRef.value, {
      sitekey: props.siteKey,
      theme: props.theme,
      size: props.size,
      action: props.action,
      cData: props.cData,
      callback: (token) => {
        console.log('Turnstile verified:', token)
        token.value = token
        error.value = null
        emit('verified', token)
      },
      'error-callback': (error) => {
        console.error('Turnstile error:', error)
        error.value = 'CAPTCHA verification failed'
        emit('error', error)
      },
      'expired-callback': () => {
        console.warn('Turnstile expired')
        token.value = null
        error.value = 'CAPTCHA expired, please try again'
        emit('expired')
      },
      'timeout-callback': () => {
        console.warn('Turnstile timeout')
        error.value = 'CAPTCHA timeout, please try again'
        emit('timeout')
      },
    })
  } catch (err) {
    console.error('Failed to initialize Turnstile:', err)
    error.value = 'Failed to load CAPTCHA'
    emit('error', err)
  }
}

const reset = () => {
  if (window.turnstile && widgetId.value !== null) {
    window.turnstile.reset(widgetId.value)
    token.value = null
    error.value = null
  }
}

const getToken = () => {
  return token.value
}

const isVerified = () => {
  return !!token.value
}

// Watch for theme changes
watch(
  () => props.theme,
  () => {
    reset()
  },
)

onMounted(() => {
  initializeTurnstile()
})

onUnmounted(() => {
  if (window.turnstile && widgetId.value !== null) {
    window.turnstile.remove(widgetId.value)
  }
})

// Expose methods to parent component
defineExpose({
  reset,
  getToken,
  isVerified,
})
</script>

<style scoped>
.turnstile-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.turnstile-widget {
  margin: 1rem 0;
}
</style>
