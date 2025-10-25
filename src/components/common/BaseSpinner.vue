<template>
  <div
    class="base-spinner"
    :class="spinnerClasses"
    :aria-label="label"
    role="status"
    aria-live="polite"
  >
    <div class="spinner-circle"></div>
    <span v-if="showLabel" class="spinner-label">
      {{ label }}
    </span>
  </div>
</template>

<script>
/**
 * BaseSpinner Component
 * @description Reusable loading spinner component with multiple sizes and styles
 *
 * Features:
 * - Multiple size variants (small, medium, large)
 * - Color customization (primary, secondary, light, dark)
 * - Optional label text
 * - Accessibility support with ARIA labels
 * - Smooth CSS animations
 * - Respects user motion preferences
 *
 * Props:
 * - size: Spinner size variant
 * - color: Color theme variant
 * - label: Accessible label text
 * - showLabel: Whether to display label text
 *
 * Design Principles:
 * - Follows design system color palette
 * - Smooth, non-distracting animations
 * - Accessible by default
 * - Consistent sizing with spacing scale
 */
import { computed } from 'vue'

export default {
  name: 'BaseSpinner',

  props: {
    /**
     * Size of the spinner
     */
    size: {
      type: String,
      default: 'medium',
      validator: (value) => ['small', 'medium', 'large'].includes(value)
    },

    /**
     * Color theme of the spinner
     */
    color: {
      type: String,
      default: 'primary',
      validator: (value) => ['primary', 'secondary', 'light', 'dark', 'white'].includes(value)
    },

    /**
     * Accessible label for screen readers
     */
    label: {
      type: String,
      default: 'Chargement en cours...'
    },

    /**
     * Whether to show the label text visually
     */
    showLabel: {
      type: Boolean,
      default: false
    }
  },

  setup(props) {
    /**
     * Computed CSS classes for the spinner
     */
    const spinnerClasses = computed(() => {
      return [
        `spinner-${props.size}`,
        `spinner-${props.color}`
      ]
    })

    return {
      spinnerClasses
    }
  }
}
</script>

<style scoped>
.base-spinner {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
}

/* Spinner Circle */
.spinner-circle {
  border-radius: 50%;
  border-style: solid;
  animation: spin 1s linear infinite;
}

/* Size Variants */
.spinner-small .spinner-circle {
  width: 16px;
  height: 16px;
  border-width: 2px;
}

.spinner-medium .spinner-circle {
  width: 24px;
  height: 24px;
  border-width: 2px;
}

.spinner-large .spinner-circle {
  width: 40px;
  height: 40px;
  border-width: 3px;
}

/* Color Variants */
.spinner-primary .spinner-circle {
  border-color: var(--color-blue);
  border-top-color: transparent;
}

.spinner-secondary .spinner-circle {
  border-color: var(--color-gray-400);
  border-top-color: transparent;
}

.spinner-light .spinner-circle {
  border-color: var(--color-gray-200);
  border-top-color: transparent;
}

.spinner-dark .spinner-circle {
  border-color: var(--color-gray-700);
  border-top-color: transparent;
}

.spinner-white .spinner-circle {
  border-color: var(--color-white);
  border-top-color: transparent;
}

/* Spinner Label */
.spinner-label {
  font-size: var(--font-size-sm);
  color: var(--color-gray-600);
  font-weight: var(--font-weight-medium);
  text-align: center;
  margin: 0;
}

.spinner-small .spinner-label {
  font-size: var(--font-size-xs);
}

.spinner-large .spinner-label {
  font-size: var(--font-size-base);
}

/* Color-specific label colors */
.spinner-dark .spinner-label {
  color: var(--color-gray-700);
}

.spinner-white .spinner-label {
  color: var(--color-white);
}

.spinner-light .spinner-label {
  color: var(--color-gray-500);
}

/* Animation */
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Accessibility: Respect reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  .spinner-circle {
    animation: none;
    /* Show a static indicator instead */
    border-top-color: var(--color-blue);
    opacity: 0.6;
  }

  .spinner-secondary .spinner-circle {
    border-top-color: var(--color-gray-400);
  }

  .spinner-light .spinner-circle {
    border-top-color: var(--color-gray-200);
  }

  .spinner-dark .spinner-circle {
    border-top-color: var(--color-gray-700);
  }

  .spinner-white .spinner-circle {
    border-top-color: var(--color-white);
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .spinner-primary .spinner-circle {
    border-color: var(--color-black);
    border-top-color: transparent;
  }

  .spinner-secondary .spinner-circle {
    border-color: var(--color-black);
    border-top-color: transparent;
  }

  .spinner-label {
    color: var(--color-black);
  }
}

/* Print styles */
@media print {
  .base-spinner {
    display: none;
  }
}
</style>
