<template>
  <AppLayout>
    <div class="main-content not-found-page">
      <!-- Error Icon -->
      <div class="error-icon">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 9V11M12 15H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>

      <!-- Error Content -->
      <div class="error-content">
        <h1 class="error-title">404</h1>
        <h2 class="error-subtitle">Page non trouvée</h2>
        <p class="error-description">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
      </div>

      <!-- Navigation Options -->
      <div class="error-actions">
        <router-link to="/" class="btn btn-primary">
          Retour à l'accueil
        </router-link>
        <button @click="goBack" class="btn btn-secondary">
          Page précédente
        </button>
      </div>

      <!-- Additional Help -->
      <div class="help-section card">
        <h3 class="help-title">Besoin d'aide ?</h3>
        <div class="help-links">
          <router-link to="/contact" class="btn btn-secondary btn-small">
            Contactez-nous
          </router-link>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script>
/**
 * NotFoundView Component
 * @description 404 error page with helpful navigation options
 *
 * Features:
 * - Clean, minimalist error display
 * - Multiple navigation options
 * - Helpful links for users
 * - Uses new design system
 * - Mobile responsive
 *
 * Design Principles:
 * - Clear error messaging
 * - Easy navigation back to main site
 * - Consistent with site design
 * - User-friendly and helpful
 */
import { useRouter } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'

export default {
  name: 'NotFoundView',

  components: {
    AppLayout
  },

  setup() {
    const router = useRouter()

    const goBack = () => {
      // Check if there's history to go back to
      if (window.history.length > 1) {
        router.go(-1)
      } else {
        // No history, go to home
        router.push('/')
      }
    }

    return {
      goBack
    }
  }
}
</script>

<style scoped>
.main-content.not-found-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: calc(100vh - var(--header-height) - var(--footer-height) - var(--space-16));
  padding: var(--space-8) var(--space-4);
}

/* Error Icon */
.error-icon {
  width: 120px;
  height: 120px;
  color: var(--color-gray-400);
  margin-bottom: var(--space-8);
}

.error-icon svg {
  width: 100%;
  height: 100%;
}

/* Error Content */
.error-content {
  margin-bottom: var(--space-8);
}

.error-title {
  font-size: 6rem;
  font-weight: var(--font-weight-bold);
  color: var(--color-color-black);
  margin: 0 0 var(--space-4) 0;
  line-height: 1;
  letter-spacing: -0.02em;
}

.error-subtitle {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-color-black);
  margin: 0 0 var(--space-4) 0;
}

.error-description {
  font-size: var(--font-size-lg);
  color: var(--color-gray-700);
  margin: 0;
  max-width: 500px;
  line-height: 1.5;
}

/* Error Actions */
.error-actions {
  display: flex;
  gap: var(--space-4);
  flex-wrap: wrap;
  justify-content: center;
  margin-bottom: var(--space-12);
}

/* Help Section */
.help-section {
  padding: var(--space-8);
  border-radius: var(--radius-card);
  background-color: var(--color-white);
  box-shadow: var(--shadow-md);
  text-align: center;
  max-width: 500px;
  width: 100%;
}

.help-title {
  font-size: var(--font-size-xl);
  color: var(--color-color-black);
  margin-bottom: var(--space-4);
}

.help-links {
  display: flex;
  gap: var(--space-4);
  justify-content: center;
  flex-wrap: wrap;
}

/* General Button Styles (for this page) */
.btn {
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-button);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  text-decoration: none;
  transition: all var(--transition-fast);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  cursor: pointer;
  border: 1px solid transparent;
}

.btn-primary {
  background-color: var(--color-blue);
  color: var(--color-white);
  border-color: var(--color-blue);
}

.btn-primary:hover {
  background-color: var(--color-blue-dark);
  border-color: var(--color-blue-dark);
}

.btn-secondary {
  background-color: transparent;
  color: var(--color-color-black);
  border-color: var(--color-gray-300);
}

.btn-secondary:hover {
  background-color: var(--color-gray-100);
  border-color: var(--color-gray-400);
}

.btn-small {
  padding: var(--space-2) var(--space-4);
  font-size: var(--font-size-sm);
}

/* Responsive Adjustments */
@media (max-width: 768px) {
  .main-content.not-found-page {
    padding: var(--space-6) var(--space-4);
  }

  .error-icon {
    width: 80px;
    height: 80px;
    margin-bottom: var(--space-6);
  }

  .error-title {
    font-size: 4rem;
  }

  .error-subtitle {
    font-size: var(--font-size-xl);
  }

  .error-description {
    font-size: var(--font-size-base);
  }

  .error-actions {
    flex-direction: column;
    gap: var(--space-3);
    margin-bottom: var(--space-8);
  }

  .btn {
    width: 100%;
  }

  .help-section {
    padding: var(--space-6);
  }

  .help-title {
    font-size: var(--font-size-lg);
  }
}
</style>
