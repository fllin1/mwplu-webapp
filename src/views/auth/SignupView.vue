<template>
  <AppLayout :show-container="false" :padded="false" full-height>
    <div class="auth-page-wrapper">
      <div class="auth-container card">
        <!-- Header -->
        <div class="auth-header">
          <div class="brand-logo">
            <h1 class="logo-text">MWPLU</h1>
          </div>
          <h2 class="auth-title">Créer un compte</h2>
          <p class="auth-subtitle">
            Rejoignez MWPLU pour accéder aux synthèses PLU
          </p>
        </div>

        <!-- Signup Form -->
        <div class="auth-form-section">
          <SignupForm />

          <!-- Navigation Links -->
          <div class="auth-navigation-links">
            <p class="nav-text">
              Déjà un compte ?
              <router-link to="/login" class="nav-link">
                Se connecter
              </router-link>
            </p>
          </div>
        </div>

        <!-- Additional Info -->
        <div class="auth-footer">
          <p class="footer-text">
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
  </AppLayout>
</template>

<script>
/**
 * SignupView Component
 * @description User registration page with integrated form and navigation
 *
 * Features:
 * - Uses new AppLayout wrapper
 * - Integrates SignupForm component with all functionality
 * - Clean, minimalist design matching production site
 * - Responsive layout for all screen sizes
 * - Proper navigation and legal links
 *
 * Design Principles:
 * - Centered layout with proper spacing
 * - Consistent typography and colors
 * - Clear visual hierarchy
 * - Accessible and user-friendly
 * - Legal compliance information
 */
import AppLayout from '@/components/layout/AppLayout.vue'
import SignupForm from '@/components/auth/SignupForm.vue'

export default {
  name: 'SignupView',

  components: {
    AppLayout,
    SignupForm
  },

  setup() {
    return {}
  }
}
</script>

<style scoped>
.auth-page-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-gray-50);
  padding: var(--space-6) var(--space-4);
}

.auth-container {
  width: 100%;
  max-width: 450px;
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
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
  color: var(--color-primary-black);
  letter-spacing: -0.02em;
  margin: 0;
}

.auth-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary-black);
  margin: var(--space-4) 0 var(--space-2) 0;
}

.auth-subtitle {
  font-size: var(--font-size-md);
  color: var(--color-gray-700);
  margin: 0;
  line-height: 1.5;
}

/* Form Container */
.auth-form-section {
  /* Form styles are mostly handled by SignupForm component directly */
  display: flex;
  flex-direction: column;
  gap: var(--space-6); /* Gap for form elements */
}

/* Navigation */
.auth-navigation-links {
  text-align: center;
  margin-top: var(--space-6);
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
  color: var(--color-gray-600);
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
  text-decoration: underline;
}

/* Mobile Responsive */
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
    margin-top: var(--space-4);
    padding-top: var(--space-3);
  }

  .nav-text {
    font-size: var(--font-size-sm);
  }

  .footer-text {
    font-size: var(--font-size-xs);
  }
}

/* Print Styles */
@media print {
  .auth-page-wrapper {
    display: none;
  }
}
</style>
