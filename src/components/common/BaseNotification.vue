<template>
  <Transition name="notification" appear>
    <div
      class="base-notification"
      :class="notificationClasses"
      role="alert"
      :aria-live="type === 'error' ? 'assertive' : 'polite'"
    >
      <div class="notification-content">
        <!-- Icon -->
        <div class="notification-icon">
          <svg v-if="type === 'success'" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>

          <svg v-else-if="type === 'error'" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>

          <svg v-else-if="type === 'warning'" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>

          <svg v-else viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
          </svg>
        </div>

        <!-- Message -->
        <div class="notification-message">
          <p class="message-text">{{ message }}</p>
          <p v-if="description" class="message-description">{{ description }}</p>
        </div>

        <!-- Close Button -->
        <button
          class="notification-close"
          @click="handleDismiss"
          aria-label="Fermer la notification"
        >
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>

      <!-- Progress Bar for Auto-dismiss -->
      <div
        v-if="autoDismiss && showProgress"
        class="notification-progress"
      >
        <div
          class="progress-bar"
          :style="{ animationDuration: `${autoDismissDelay}ms` }"
        ></div>
      </div>
    </div>
  </Transition>
</template>

<script>
/**
 * BaseNotification Component
 * @description Toast notification component for user feedback
 *
 * Features:
 * - Multiple notification types (success, error, warning, info)
 * - Auto-dismiss functionality with configurable delay
 * - Progress bar for auto-dismiss notifications
 * - Accessible design with proper ARIA attributes
 * - Smooth enter/leave transitions
 * - Manual dismiss capability
 *
 * Props:
 * - type: Notification type (success, error, warning, info)
 * - message: Main notification message
 * - description: Optional secondary description
 * - autoDismiss: Whether to auto-dismiss
 * - autoDismissDelay: Delay before auto-dismiss (ms)
 * - showProgress: Whether to show progress bar
 *
 * Events:
 * - dismiss: Emitted when notification is dismissed
 *
 * Design Principles:
 * - Clear visual hierarchy with icons and colors
 * - Non-intrusive but noticeable
 * - Accessible to screen readers
 * - Consistent with design system colors
 */
import { ref, computed, onMounted, onUnmounted } from 'vue'

export default {
  name: 'BaseNotification',

  props: {
    /**
     * Type of notification
     */
    type: {
      type: String,
      default: 'info',
      validator: (value) => ['success', 'error', 'warning', 'info'].includes(value)
    },

    /**
     * Main notification message
     */
    message: {
      type: String,
      required: true
    },

    /**
     * Optional description text
     */
    description: {
      type: String,
      default: ''
    },

    /**
     * Whether to automatically dismiss
     */
    autoDismiss: {
      type: Boolean,
      default: true
    },

    /**
     * Auto-dismiss delay in milliseconds
     */
    autoDismissDelay: {
      type: Number,
      default: 5000
    },

    /**
     * Whether to show progress bar for auto-dismiss
     */
    showProgress: {
      type: Boolean,
      default: true
    }
  },

  emits: ['dismiss'],

  setup(props, { emit }) {
    const dismissTimer = ref(null)

    /**
     * Computed CSS classes for the notification
     */
    const notificationClasses = computed(() => {
      return [`notification-${props.type}`]
    })

    /**
     * Handle notification dismiss
     */
    const handleDismiss = () => {
      clearTimeout(dismissTimer.value)
      emit('dismiss')
    }

    /**
     * Setup auto-dismiss timer
     */
    const setupAutoDismiss = () => {
      if (props.autoDismiss) {
        dismissTimer.value = setTimeout(() => {
          handleDismiss()
        }, props.autoDismissDelay)
      }
    }

    /**
     * Lifecycle hooks
     */
    onMounted(() => {
      setupAutoDismiss()
    })

    onUnmounted(() => {
      clearTimeout(dismissTimer.value)
    })

    return {
      notificationClasses,
      handleDismiss
    }
  }
}
</script>

<style scoped>
.base-notification {
  position: fixed;
  top: var(--space-6);
  right: var(--space-6);
  z-index: var(--z-tooltip);
  background-color: var(--color-white);
  border-radius: var(--radius-form);
  box-shadow: var(--shadow-lg);
  border-left: 4px solid;
  max-width: 400px;
  min-width: 300px;
  overflow: hidden;
}

.notification-content {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-4);
}

/* Icons */
.notification-icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  margin-top: 2px; /* Align with first line of text */
}

/* Message Content */
.notification-message {
  flex: 1;
  min-width: 0; /* Allow text to wrap */
}

.message-text {
  margin: 0;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-black);
  line-height: var(--line-height-tight);
}

.message-description {
  margin: var(--space-1) 0 0 0;
  font-size: var(--font-size-xs);
  color: var(--color-gray-600);
  line-height: var(--line-height-normal);
}

/* Close Button */
.notification-close {
  flex-shrink: 0;
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--space-1);
  border-radius: var(--radius-button);
  color: var(--color-gray-400);
  transition: all var(--transition-fast);
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-close:hover {
  color: var(--color-gray-600);
  background-color: var(--color-gray-100);
}

.notification-close:focus {
  outline: 2px solid var(--color-blue);
  outline-offset: 1px;
}

/* Progress Bar */
.notification-progress {
  height: 3px;
  background-color: rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  width: 100%;
  transform: translateX(-100%);
  animation: progress linear forwards;
}

@keyframes progress {
  to {
    transform: translateX(0);
  }
}

/* Type-specific Styles */
.notification-success {
  border-left-color: var(--color-success);
}

.notification-success .notification-icon {
  color: var(--color-success);
}

.notification-success .progress-bar {
  background-color: var(--color-success);
}

.notification-error {
  border-left-color: var(--color-error);
}

.notification-error .notification-icon {
  color: var(--color-error);
}

.notification-error .progress-bar {
  background-color: var(--color-error);
}

.notification-warning {
  border-left-color: #F59E0B; /* Warning orange */
}

.notification-warning .notification-icon {
  color: #F59E0B;
}

.notification-warning .progress-bar {
  background-color: #F59E0B;
}

.notification-info {
  border-left-color: var(--color-blue);
}

.notification-info .notification-icon {
  color: var(--color-blue);
}

.notification-info .progress-bar {
  background-color: var(--color-blue);
}

/* Transitions */
.notification-enter-active,
.notification-leave-active {
  transition: all var(--transition-base);
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

/* Mobile Responsive */
@media (max-width: 640px) {
  .base-notification {
    top: var(--space-4);
    right: var(--space-4);
    left: var(--space-4);
    max-width: none;
    min-width: auto;
  }

  .notification-content {
    padding: var(--space-3);
  }

  .message-text {
    font-size: var(--font-size-xs);
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .notification-enter-active,
  .notification-leave-active {
    transition: opacity var(--transition-fast);
  }

  .notification-enter-from,
  .notification-leave-to {
    transform: none;
  }

  .progress-bar {
    animation: none;
    transform: translateX(0);
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .base-notification {
    border: 2px solid var(--color-black);
  }

  .message-text {
    color: var(--color-black);
  }

  .message-description {
    color: var(--color-black);
  }
}

/* Print styles */
@media print {
  .base-notification {
    display: none;
  }
}
</style>
