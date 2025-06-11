<template>
  <div class="app-layout">
    <!-- Application Header -->
    <AppHeader />

    <!-- Main Content Area -->
    <main class="main-content" :class="contentClasses">
      <div v-if="showContainer" class="content-container">
        <slot />
      </div>
      <slot v-else />
    </main>

    <!-- Application Footer -->
    <AppFooter />

    <!-- Global Notifications -->
    <BaseNotification
      v-if="notification.show"
      :type="notification.type"
      :message="notification.message"
      :auto-dismiss="notification.autoDismiss"
      @dismiss="dismissNotification"
    />

    <!-- Global Loading Overlay -->
    <div v-if="isGlobalLoading" class="global-loading-overlay">
      <BaseSpinner size="large" />
      <p class="loading-text">{{ loadingText }}</p>
    </div>
  </div>
</template>

<script>
/**
 * AppLayout Component
 * @description Main application layout wrapper component
 *
 * Features:
 * - Consistent header and footer across all pages
 * - Flexible main content area with optional container
 * - Global notification system
 * - Global loading state management
 * - Responsive design with mobile considerations
 *
 * Props:
 * - showContainer: Whether to wrap content in a max-width container
 * - contentClass: Additional CSS classes for content area
 * - fullHeight: Whether content should take full viewport height
 *
 * Design Principles:
 * - Semantic HTML structure for accessibility
 * - Flexible layout system for different page types
 * - Consistent spacing and typography
 * - Mobile-first responsive approach
 */
import { computed } from 'vue'
import { useUIStore } from '@/stores/ui'
import AppHeader from './AppHeader.vue'
import AppFooter from './AppFooter.vue'
import BaseNotification from '@/components/common/BaseNotification.vue'
import BaseSpinner from '@/components/common/BaseSpinner.vue'

export default {
  name: 'AppLayout',

  components: {
    AppHeader,
    AppFooter,
    BaseNotification,
    BaseSpinner
  },

  props: {
    /**
     * Whether to wrap content in a centered container
     */
    showContainer: {
      type: Boolean,
      default: true
    },

    /**
     * Additional CSS classes for the content area
     */
    contentClass: {
      type: String,
      default: ''
    },

    /**
     * Whether content should take full viewport height
     */
    fullHeight: {
      type: Boolean,
      default: false
    },

    /**
     * Whether to add padding to the content area
     */
    padded: {
      type: Boolean,
      default: true
    }
  },

  setup(props) {
    const uiStore = useUIStore()

    /**
     * Global UI state
     */
    const notification = computed(() => uiStore.notification)
    const isGlobalLoading = computed(() => uiStore.isGlobalLoading)
    const loadingText = computed(() => uiStore.loadingText)

    /**
     * Content area CSS classes
     */
    const contentClasses = computed(() => {
      const classes = []

      if (props.fullHeight) {
        classes.push('full-height')
      }

      if (props.padded) {
        classes.push('padded')
      }

      if (props.contentClass) {
        classes.push(props.contentClass)
      }

      return classes.join(' ')
    })

    /**
     * Dismiss global notification
     */
    const dismissNotification = () => {
      uiStore.hideNotification()
    }

    return {
      notification,
      isGlobalLoading,
      loadingText,
      contentClasses,
      dismissNotification
    }
  }
}
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--color-white);
}

/* Main Content Area */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.main-content.full-height {
  min-height: calc(100vh - 64px - 200px); /* Viewport minus header and footer approximate heights */
}

.main-content.padded {
  padding: var(--space-6) 0;
}

.content-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-4);
  width: 100%;
  flex: 1;
}

/* Global Loading Overlay */
.global-loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
  z-index: var(--z-modal);
  backdrop-filter: blur(2px);
}

.loading-text {
  color: var(--color-gray-600);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  margin: 0;
  text-align: center;
}

/* Responsive Design */
@media (max-width: 768px) {
  .main-content.padded {
    padding: var(--space-4) 0;
  }

  .content-container {
    padding: 0 var(--space-3);
  }

  .main-content.full-height {
    min-height: calc(100vh - 56px - 180px); /* Adjusted for mobile header/footer heights */
  }
}

@media (max-width: 480px) {
  .main-content.padded {
    padding: var(--space-3) 0;
  }

  .content-container {
    padding: 0 var(--space-2);
  }
}

/* Print Styles */
@media print {
  .app-layout {
    min-height: auto;
  }

  .global-loading-overlay {
    display: none;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .global-loading-overlay {
    background-color: rgba(255, 255, 255, 0.95);
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .global-loading-overlay {
    backdrop-filter: none;
  }
}
</style>
