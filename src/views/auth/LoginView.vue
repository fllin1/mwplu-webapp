<template>
  <AppLayout :show-container="false" :padded="false" full-height>
    <div class="auth-page-wrapper">
      <div class="auth-container card">
        <!-- Header -->
        <div class="auth-header">
          <div class="brand-logo">
            <h1 class="logo-text">MWPLU</h1>
          </div>
          <h2 class="auth-title">Connexion</h2>
          <p class="auth-subtitle">
            Accédez à votre compte pour consulter les synthèses PLU
          </p>
        </div>

        <!-- Login Form -->
        <div class="auth-form-section">
          <LoginForm @success="onLoginSuccess" @forgot-password="onForgotPassword" />

          <!-- Navigation Links -->
          <div class="auth-navigation-links">
            <p class="nav-text">
              Pas encore de compte ?
              <router-link to="/signup" class="nav-link">
                Créer un compte
              </router-link>
            </p>
          </div>
        </div>

        <!-- Additional Info -->
        <div class="auth-footer">
          <p class="footer-text">
            En vous connectant, vous acceptez nos
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
 * LoginView Component
 * @description User login page with integrated form and navigation
 *
 * Features:
 * - Uses AppLayout wrapper with proper header spacing
 * - Integrates LoginForm component with all functionality
 * - Clean, minimalist design matching production site
 * - Responsive layout for all screen sizes
 * - Proper navigation and legal links
 * - Google OAuth integration
 *
 * Design Principles:
 * - Centered layout with proper spacing
 * - Consistent typography and colors
 * - Clear visual hierarchy
 * - Accessible and user-friendly
 * - Legal compliance information
 */
import { useRouter } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'
import LoginForm from '@/components/auth/LoginForm.vue'

export default {
  name: 'LoginView',

  components: {
    AppLayout,
    LoginForm
  },

  setup() {
    const router = useRouter()

    /**
     * Handle successful login
     */
    const onLoginSuccess = async (data) => {
      console.log('Login successful:', data)

      // Navigate to dashboard or intended route
      const redirect = router.currentRoute.value.query.redirect || '/dashboard'
      await router.push(redirect)
    }

    /**
     * Handle forgot password request
     */
    const onForgotPassword = (email) => {
      console.log('Forgot password for:', email)

      // Navigate to reset password page with pre-filled email
      router.push({
        path: '/reset-password',
        query: { email: email || '' }
      })
    }

    return {
      onLoginSuccess,
      onForgotPassword
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
  border-radius: var(--radius-form);
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
  font-weight: var(--font-weight-bold);
  color: var(--color-black);
  letter-spacing: -0.02em;
  margin: 0;
}

.auth-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-black);
  margin: var(--space-4) 0 var(--space-2) 0;
}

.auth-subtitle {
  font-size: var(--font-size-base);
  color: var(--color-gray-700);
  margin: 0;
  line-height: 1.5;
}

/* Form Container */
.auth-form-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
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
  color: var(--color-blue-hover);
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
  color: var(--color-blue-hover);
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
