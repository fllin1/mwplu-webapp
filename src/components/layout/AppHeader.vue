<template>
  <header class="app-header" :class="{ scrolled: isScrolled }">
    <div class="header-container">
      <!-- Logo and Brand -->
      <div class="header-brand">
        <router-link to="/" class="logo-link">
          <img src="@/assets/icons/logos/mwplu.svg" alt="MWPLU Logo" class="header-logo" />
        </router-link>
      </div>

      <!-- Desktop Navigation -->
      <nav class="header-nav" :class="{ 'nav-open': isMobileMenuOpen }">
        <ul class="nav-list">
          <!-- Public Routes -->
          <li class="nav-item">
            <router-link to="/" class="nav-link" @click="closeMobileMenu">
              Accueil
            </router-link>
          </li>

          <!-- Authenticated Routes -->
          <li v-if="isAuthenticated" class="nav-item">
            <router-link to="/dashboard" class="nav-link" @click="closeMobileMenu">
              Tableau de bord
            </router-link>
          </li>

          <!-- Future Routes -->
          <li class="nav-item">
            <router-link to="/info/about" class="nav-link" @click="closeMobileMenu">
              À propos
            </router-link>
          </li>

          <li class="nav-item">
            <router-link to="/contact" class="nav-link" @click="closeMobileMenu">
              Contact
            </router-link>
          </li>
        </ul>

        <!-- User Menu / Auth Buttons -->
        <div class="header-actions">
          <div v-if="isAuthenticated" class="user-menu">
            <!-- User Dropdown -->
            <button @click="toggleUserMenu" class="user-button">
              <div class="user-avatar">{{ userInitials }}</div>
              <span class="user-name">{{ userName }}</span>
            </button>

            <!-- Dropdown Menu -->
            <div v-show="isUserMenuOpen" class="dropdown-menu">
              <router-link to="/profile" class="dropdown-item" @click="closeUserMenu">
                Mon profil
              </router-link>
              <button @click="handleLogout" class="dropdown-item logout-item">
                Se déconnecter
              </button>
            </div>
          </div>

          <!-- Auth Buttons (Guest Users) -->
          <div v-else class="auth-buttons">
            <router-link to="/login" class="auth-button auth-button-secondary">
              Connexion
            </router-link>
            <router-link to="/signup" class="auth-button auth-button-primary">
              Créer un compte
            </router-link>
          </div>
        </div>
      </nav>

      <!-- Mobile Menu Toggle -->
      <button
        class="mobile-menu-toggle"
        @click="toggleMobileMenu"
        :aria-expanded="isMobileMenuOpen"
        aria-label="Menu de navigation"
      >
        <div class="hamburger" :class="{ 'hamburger-open': isMobileMenuOpen }">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </button>
    </div>

    <!-- Mobile Menu Overlay -->
    <div
      v-show="isMobileMenuOpen"
      class="mobile-overlay"
      @click="closeMobileMenu"
    ></div>
  </header>
</template>

<script>
/**
 * AppHeader Component
 * @description Main application header with navigation and user menu
 *
 * Features:
 * - Responsive design (desktop + mobile)
 * - User authentication state handling
 * - Dropdown user menu for authenticated users
 * - Mobile hamburger menu
 * - Clean, minimalist design matching production
 *
 * Design Principles:
 * - Black text on white background
 * - Blue accent for interactive elements
 * - Lato font family
 * - 4px spacing grid
 * - Accessible navigation with ARIA labels
 */
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'AppHeader',

  setup() {
    const router = useRouter()
    const authStore = useAuthStore()

    // Component state
    const isMobileMenuOpen = ref(false)
    const isUserMenuOpen = ref(false)
    const isScrolled = ref(false)

    // Auth state
    const isAuthenticated = computed(() => authStore.isAuthenticated)
    const user = computed(() => authStore.user)

    // User display information
    const userName = computed(() => {
      if (!user.value) return ''
      return user.value.user_metadata?.name ||
             user.value.user_metadata?.full_name ||
             user.value.email?.split('@')[0] ||
             'Utilisateur'
    })

    const userInitials = computed(() => {
      if (!userName.value) return 'U'
      return userName.value
        .split(' ')
        .map(word => word.charAt(0).toUpperCase())
        .slice(0, 2)
        .join('')
    })

    /**
     * Navigation Methods
     */
    const toggleMobileMenu = () => {
      isMobileMenuOpen.value = !isMobileMenuOpen.value
    }

    const closeMobileMenu = () => {
      isMobileMenuOpen.value = false
    }

    const toggleUserMenu = () => {
      isUserMenuOpen.value = !isUserMenuOpen.value
    }

    const closeUserMenu = () => {
      isUserMenuOpen.value = false
    }

    /**
     * Handle user logout
     */
    const handleLogout = async () => {
      try {
        await authStore.logout()
        closeUserMenu()
        await router.push('/')
      } catch (error) {
        console.error('Logout error:', error)
      }
    }

    /**
     * Handle scroll event for header effects
     */
    const handleScroll = () => {
      isScrolled.value = window.scrollY > 0
    }

    /**
     * Close dropdowns when clicking outside
     */
    const handleClickOutside = (event) => {
      // Close user menu if clicking outside
      if (isUserMenuOpen.value && !event.target.closest('.user-menu')) {
        isUserMenuOpen.value = false
      }
    }

    /**
     * Handle escape key to close menus
     */
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        closeMobileMenu()
        closeUserMenu()
      }
    }

    /**
     * Lifecycle hooks
     */
    onMounted(() => {
      document.addEventListener('scroll', handleScroll)
      document.addEventListener('click', handleClickOutside)
      document.addEventListener('keydown', handleEscapeKey)
    })

    onUnmounted(() => {
      document.removeEventListener('scroll', handleScroll)
      document.removeEventListener('click', handleClickOutside)
      document.removeEventListener('keydown', handleEscapeKey)
    })

    return {
      // State
      isMobileMenuOpen,
      isUserMenuOpen,
      isScrolled,
      isAuthenticated,
      user,
      userName,
      userInitials,

      // Methods
      toggleMobileMenu,
      closeMobileMenu,
      toggleUserMenu,
      closeUserMenu,
      handleLogout
    }
  }
}
</script>

<style scoped>
/*
  Header Styling
*/
.app-header {
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  position: fixed; /* Changed from sticky to fixed for consistent scroll behavior */
  width: 100%;
  top: 0;
  left: 0;
  z-index: 1000;
  transition: all 0.3s ease;
}

.app-header.scrolled {
  background-color: rgba(255, 255, 255, 0.9);
  border-bottom-color: var(--border-gray, #eaeaea);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 9px 24px; /* Adjust padding as needed */
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-brand {
  display: flex;
  align-items: center;
}

.logo-link {
  display: flex;
  align-items: center;
  text-decoration: none;
}

.header-logo {
  height: 48px; /* Default height */
  transition: all 0.3s ease;
}

.app-header.scrolled .header-logo {
  height: 44px; /* Smaller height when scrolled */
}

.logo-link:hover .header-logo {
  opacity: 0.7;
  transform: scale(1.05);
}

.brand-subtitle {
  font-size: var(--font-size-sm);
  color: var(--color-gray-600);
  margin-left: 10px;
  white-space: nowrap;
  opacity: 0.8;
  transition: opacity 0.3s ease;
}

.app-header.scrolled .brand-subtitle {
  opacity: 0;
}

.header-nav {
  display: flex;
  align-items: center;
  gap: 24px;
}

.nav-list {
  display: flex;
  list-style: none;
  padding: 0;
  margin: 0;
  gap: 20px;
}

.nav-link {
  text-decoration: none;
  color: var(--color-black);
  font-weight: var(--font-weight-medium);
  padding: 8px 12px;
  transition: all 0.2s ease;
  border-radius: var(--radius-button);
}

.nav-link:hover {
  background: rgba(0, 0, 0, 0.05);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.auth-buttons {
  display: flex;
  gap: 12px;
}

.auth-button {
  padding: 8px 16px;
  border-radius: var(--radius-button);
  text-decoration: none;
  transition: all 0.2s ease;
}

.auth-button-primary {
  background-color: transparent;
  color: var(--color-black);
  border: 1px solid var(--color-gray-300);
}

.auth-button-primary:hover {
  background-color: var(--color-gray-100);
  color: var(--color-black);
  border-color: var(--color-gray-400);
  box-shadow: var(--shadow-sm);
  transform: translateY(-1px);
}

.auth-button-secondary {
  background-color: transparent;
  color: var(--color-black);
  border: 1px solid var(--color-gray-300);
}

.auth-button-secondary:hover {
  background-color: var(--color-gray-100);
  border-color: var(--color-gray-400);
  box-shadow: var(--shadow-sm);
  transform: translateY(-1px);
}

.user-menu {
  position: relative;
}

.user-button {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: var(--radius-button);
  transition: all 0.2s ease;
}

.user-button:hover {
  background: rgba(0, 0, 0, 0.05);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: var(--color-blue);
  color: var(--color-white);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
}

.user-name {
  color: var(--color-black);
  font-weight: var(--font-weight-medium);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  background-color: var(--color-white);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-md);
  min-width: 180px;
  padding: 8px 0;
  z-index: var(--z-dropdown-menu);
}

.dropdown-item {
  display: block;
  padding: 10px 16px;
  color: var(--color-black);
  text-decoration: none;
  transition: background-color 0.15s ease;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
}

.dropdown-item:hover {
  background-color: var(--color-gray-100);
}

.logout-item {
  color: var(--color-red-600);
}

.logout-item:hover {
  background-color: var(--color-red-50);
}

/* Mobile Menu */
.mobile-menu-toggle {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 10px;
  z-index: 1100;
}

.hamburger {
  width: 24px;
  height: 18px;
  position: relative;
  transform: rotate(0deg);
  transition: 0.3s ease-in-out;
}

.hamburger span {
  display: block;
  position: absolute;
  height: 2px;
  width: 100%;
  background: var(--color-black);
  border-radius: 9px;
  opacity: 1;
  left: 0;
  transform: rotate(0deg);
  transition: 0.25s ease-in-out;
}

.hamburger span:nth-child(1) {
  top: 0px;
}

.hamburger span:nth-child(2),
.hamburger span:nth-child(3) {
  top: 8px;
}

.hamburger span:nth-child(4) {
  top: 16px;
}

.hamburger-open span:nth-child(1),
.hamburger-open span:nth-child(4) {
  top: 8px;
  width: 0%;
  left: 50%;
}

.hamburger-open span:nth-child(2) {
  transform: rotate(45deg);
}

.hamburger-open span:nth-child(3) {
  transform: rotate(-45deg);
}

.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

/* Responsive */
@media (max-width: 768px) {
  .header-nav {
    display: none;
    flex-direction: column;
    position: fixed;
    top: 0;
    right: 0;
    width: 280px;
    height: 100vh;
    background-color: var(--color-white);
    box-shadow: -4px 0 20px rgba(0, 0, 0, 0.1);
    padding: 80px 20px 20px;
    transform: translateX(100%);
    transition: transform 0.3s ease-in-out;
    z-index: 1000;
  }

  .header-nav.nav-open {
    display: flex;
    transform: translateX(0%);
  }

  .nav-list {
    flex-direction: column;
    align-items: center;
    gap: 15px;
    width: 100%;
    margin-bottom: 20px;
  }

  .nav-item {
    width: 100%;
  }

  .nav-link {
    display: block;
    width: 100%;
    padding: 12px 10px;
    text-align: center;
  }

  .header-actions {
    flex-direction: column;
    align-items: center;
    width: 100%;
    gap: 15px;
  }

  .auth-buttons {
    flex-direction: column;
    width: 100%;
    gap: 10px;
    border: none;
    padding: 0;
  }

  .auth-button {
    width: 100%;
    text-align: center;
  }

  .user-menu {
    width: 100%;
  }

  .user-button {
    width: 100%;
    justify-content: center;
  }

  .dropdown-menu {
    position: static;
    width: 100%;
    box-shadow: none;
    border: none;
    padding: 0;
  }

  .dropdown-item {
    text-align: center;
  }

  .mobile-menu-toggle {
    display: block;
  }

  .header-brand .brand-subtitle {
    display: none;
  }
}
</style>
