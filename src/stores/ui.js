/**
 * UI Store
 * @module useUIStore
 * @description Manages global UI state including notifications, loading states, and modals
 * @version 1.0.0
 * @author GreyPanda
 *
 * @changelog
 * - 1.0.0 (2025-06-08): Initial version with basic UI store functionality.
 *
 * Features:
 * - Global notification system with different types
 * - Loading state management for async operations
 * - Modal state management
 * - Theme preferences (future)
 * - Mobile menu state
 *
 * Design Principles:
 * - Single source of truth for UI state
 * - Simple, predictable state mutations
 * - TypeScript-like JSDoc for better developer experience
 * - Consistent with auth store patterns
 */
import { defineStore } from 'pinia'

export const useUIStore = defineStore('ui', {
  /**
   * Initial state
   */
  state: () => ({
    // Notification System
    notification: {
      show: false,
      type: 'info', // 'success', 'error', 'warning', 'info'
      message: '',
      description: '',
      autoDismiss: true,
      autoDismissDelay: 5000,
    },

    // Loading States
    isGlobalLoading: false,
    loadingText: 'Chargement...',

    // Modal System
    modals: {
      // Example: confirmDialog: { show: false, title: '', message: '', onConfirm: null }
    },

    // Navigation State
    isMobileMenuOpen: false,

    // Theme Preferences (future feature)
    theme: 'light', // 'light', 'dark', 'auto'

    // Layout Preferences
    sidebarCollapsed: false,
  }),

  /**
   * Computed getters
   */
  getters: {
    /**
     * Whether any modal is currently open
     */
    hasOpenModal: (state) => {
      return Object.values(state.modals).some((modal) => modal.show)
    },

    /**
     * Whether the UI is in a loading state
     */
    isLoading: (state) => {
      return state.isGlobalLoading
    },

    /**
     * Current notification state
     */
    currentNotification: (state) => {
      return state.notification.show ? state.notification : null
    },
  },

  /**
   * Actions
   */
  actions: {
    /**
     * Show a notification
     * @param {Object} options - Notification options
     * @param {string} options.type - Type of notification
     * @param {string} options.message - Main message
     * @param {string} [options.description] - Optional description
     * @param {boolean} [options.autoDismiss] - Whether to auto-dismiss
     * @param {number} [options.autoDismissDelay] - Auto-dismiss delay in ms
     */
    showNotification({
      type = 'info',
      message,
      description = '',
      autoDismiss = true,
      autoDismissDelay = 5000,
    }) {
      // Validate message is not empty
      if (!message || typeof message !== 'string' || message.trim() === '') {
        console.warn('Attempted to show notification with empty message:', message)
        return
      }

      // Hide any existing notification first
      this.hideNotification()

      // Show new notification
      this.notification = {
        show: true,
        type,
        message: message.trim(),
        description,
        autoDismiss,
        autoDismissDelay,
      }
    },

    /**
     * Hide the current notification
     */
    hideNotification() {
      this.notification.show = false
    },

    /**
     * Show a success notification
     * @param {string} message - Success message
     * @param {string} [description] - Optional description
     */
    showSuccess(message, description = '') {
      this.showNotification({
        type: 'success',
        message,
        description,
        autoDismiss: true,
        autoDismissDelay: 4000,
      })
    },

    /**
     * Show an error notification
     * @param {string} message - Error message
     * @param {string} [description] - Optional description
     */
    showError(message, description = '') {
      this.showNotification({
        type: 'error',
        message,
        description,
        autoDismiss: false, // Errors don't auto-dismiss
      })
    },

    /**
     * Show a warning notification
     * @param {string} message - Warning message
     * @param {string} [description] - Optional description
     */
    showWarning(message, description = '') {
      this.showNotification({
        type: 'warning',
        message,
        description,
        autoDismiss: true,
        autoDismissDelay: 7000,
      })
    },

    /**
     * Show an info notification
     * @param {string} message - Info message
     * @param {string} [description] - Optional description
     */
    showInfo(message, description = '') {
      this.showNotification({
        type: 'info',
        message,
        description,
        autoDismiss: true,
        autoDismissDelay: 7000,
      })
    },

    /**
     * Set global loading state
     * @param {boolean} loading - Whether to show loading
     * @param {string} [text] - Loading text
     */
    setGlobalLoading(loading, text = 'Chargement...') {
      this.isGlobalLoading = loading
      this.loadingText = text
    },

    /**
     * Show global loading
     * @param {string} [text] - Loading text
     */
    showGlobalLoading(text = 'Chargement...') {
      this.setGlobalLoading(true, text)
    },

    /**
     * Hide global loading
     */
    hideGlobalLoading() {
      this.setGlobalLoading(false)
    },

    /**
     * Open a modal
     * @param {string} modalId - Modal identifier
     * @param {Object} options - Modal options
     */
    openModal(modalId, options = {}) {
      this.modals[modalId] = {
        show: true,
        ...options,
      }
    },

    /**
     * Close a modal
     * @param {string} modalId - Modal identifier
     */
    closeModal(modalId) {
      if (this.modals[modalId]) {
        this.modals[modalId].show = false
      }
    },

    /**
     * Close all modals
     */
    closeAllModals() {
      Object.keys(this.modals).forEach((modalId) => {
        this.modals[modalId].show = false
      })
    },

    /**
     * Toggle mobile menu
     */
    toggleMobileMenu() {
      this.isMobileMenuOpen = !this.isMobileMenuOpen
    },

    /**
     * Close mobile menu
     */
    closeMobileMenu() {
      this.isMobileMenuOpen = false
    },

    /**
     * Set theme preference
     * @param {string} theme - Theme name ('light', 'dark', 'auto')
     */
    setTheme(theme) {
      if (['light', 'dark', 'auto'].includes(theme)) {
        this.theme = theme
        // Save to localStorage for persistence
        localStorage.setItem('mwplu-theme', theme)
      }
    },

    /**
     * Initialize theme from localStorage
     */
    initializeTheme() {
      const savedTheme = localStorage.getItem('mwplu-theme')
      if (savedTheme && ['light', 'dark', 'auto'].includes(savedTheme)) {
        this.theme = savedTheme
      }
    },

    /**
     * Toggle sidebar collapsed state
     */
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed
    },

    /**
     * Handle API errors consistently
     * @param {Error} error - Error object
     * @param {string} [context] - Context where error occurred
     */
    handleApiError(error, context = '') {
      console.error('API Error:', error, context)

      let message = "Une erreur inattendue s'est produite"
      let description = ''

      if (error.response) {
        // HTTP error response
        switch (error.response.status) {
          case 400:
            message = 'Requête invalide'
            description = 'Veuillez vérifier vos données et réessayer'
            break
          case 401:
            message = 'Session expirée'
            description = 'Veuillez vous reconnecter'
            break
          case 403:
            message = 'Accès refusé'
            description = "Vous n'avez pas les autorisations nécessaires"
            break
          case 404:
            message = 'Ressource introuvable'
            description = "L'élément demandé n'existe pas"
            break
          case 429:
            message = 'Trop de requêtes'
            description = 'Veuillez patienter avant de réessayer'
            break
          case 500:
            message = 'Erreur serveur'
            description = 'Nos services sont temporairement indisponibles'
            break
          default:
            message = `Erreur ${error.response.status}`
            description = error.response.data?.message || 'Veuillez réessayer plus tard'
        }
      } else if (error.message) {
        // Network or other error
        if (error.message.includes('network') || error.message.includes('fetch')) {
          message = 'Problème de connexion'
          description = 'Vérifiez votre connexion internet'
        } else {
          description = error.message
        }
      }

      // Add context if provided
      if (context) {
        description = description ? `${context}: ${description}` : context
      }

      this.showError(message, description)
    },

    /**
     * Reset UI state (useful for logout)
     */
    resetUIState() {
      this.hideNotification()
      this.hideGlobalLoading()
      this.closeAllModals()
      this.closeMobileMenu()
    },
  },
})
