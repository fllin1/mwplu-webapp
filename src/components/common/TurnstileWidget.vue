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
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useTurnstile } from '@/composables/useTurnstile'

const props = defineProps({
  siteKey: {
    type: String,
    // The default value is sourced from environment variables for standard use,
    // but can be overridden by a prop for specific cases.
    default: () => import.meta.env.VITE_TURNSTILE_SITE_KEY,
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

const { isLoaded } = useTurnstile()

const renderTurnstile = async () => {
  // Check prerequisites
  if (!isLoaded.value || !turnstileRef.value || widgetId.value) {
    return
  }

  // Ensure DOM is ready
  await nextTick()

  try {
    if (!window.turnstile) {
      throw new Error('Turnstile not available')
    }

    widgetId.value = window.turnstile.render(turnstileRef.value, {
      sitekey: props.siteKey,
      theme: props.theme,
      size: props.size,
      action: props.action,
      cData: props.cData,
      callback: (verifiedToken) => {
        token.value = verifiedToken
        error.value = null
        emit('verified', verifiedToken)
      },
      'error-callback': (err) => {
        error.value = 'CAPTCHA verification failed'
        emit('error', err)
      },
      'expired-callback': () => {
        token.value = null
        error.value = 'CAPTCHA expired, please try again'
        emit('expired')
      },
      'timeout-callback': () => {
        error.value = 'CAPTCHA timeout, please try again'
        emit('timeout')
      },
    })
  } catch (err) {
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

const getToken = () => token.value
const isVerified = () => !!token.value

// Render when component mounts if script is ready
onMounted(() => {
  if (isLoaded.value) {
    renderTurnstile()
  }
})

// Render when script becomes available
watch(isLoaded, (newValue) => {
  if (newValue) {
    renderTurnstile()
  }
})

// Re-render on theme change
watch(() => props.theme, () => {
  if (widgetId.value !== null && window.turnstile) {
    window.turnstile.remove(widgetId.value)
    widgetId.value = null
    renderTurnstile()
  }
})

// Cleanup on unmount
onUnmounted(() => {
  if (window.turnstile && widgetId.value !== null) {
    window.turnstile.remove(widgetId.value)
  }
})

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
