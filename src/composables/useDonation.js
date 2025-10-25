/**
 * Donation Composable
 * @module useDonation
 * @description Handles donation logic with Stripe payment links
 * @version 1.0.0
 *
 * Features:
 * - Pre-configured Stripe payment links for common amounts
 * - Custom amount handling via pay-what-you-want link
 * - Secure payment processing in new window
 * - User-friendly notifications and error handling
 *
 * Design Principles:
 * - Clean separation of concerns
 * - Reusable across components
 * - Consistent with existing composable patterns
 * - Proper error handling and user feedback
 */

import { ref, computed } from 'vue'
import { useUIStore } from '@/stores/ui'

// Stripe payment links for preset amounts
const DONATION_LINKS = {
  5: 'https://buy.stripe.com/fZu6oJ2R9fAp6GN0ms9Zm07',
  10: 'https://buy.stripe.com/4gM28t4Zhcod5CJ2uA9Zm06',
  15: 'https://buy.stripe.com/8x2fZj0J14VLe9fc5a9Zm03',
  20: 'https://buy.stripe.com/bJe9AV77pcod6GN3yE9Zm05',
  30: 'https://buy.stripe.com/7sY9AV9fx9c10ip1qw9Zm02',
  50: 'https://buy.stripe.com/6oU7sN0J1fAp7KR0ms9Zm04',
  100: 'https://buy.stripe.com/aFa7sN77p0Fv7KR2uA9Zm01',
}

// Custom amount payment link (pay-what-you-want)
const CUSTOM_AMOUNT_LINK = 'https://buy.stripe.com/6oUfZj77pgEtfdjb169Zm00'

/**
 * Donation composable
 * @returns {Object} Donation functionality
 */
export function useDonation() {
  const uiStore = useUIStore()

  // State
  const isProcessing = ref(false)
  const selectedAmount = ref(5)
  const customAmountInput = ref('')

  // Constants
  const presetAmounts = [5, 10, 15, 20, 30, 50, 100]

  // Computed
  const canDonate = computed(() => {
    return selectedAmount.value > 0 && !isProcessing.value
  })

  /**
   * Select a preset donation amount
   * @param {number} amount - The preset amount to select
   */
  const selectPresetAmount = (amount) => {
    selectedAmount.value = amount
    customAmountInput.value = ''
  }

  /**
   * Handle custom amount input changes
   */
  const handleCustomAmount = () => {
    if (customAmountInput.value && customAmountInput.value > 0) {
      selectedAmount.value = parseInt(customAmountInput.value)
    } else if (!customAmountInput.value) {
      selectedAmount.value = 5 // Default back to 5€
    }
  }

  /**
   * Process donation by opening Stripe checkout
   * @param {number} amount - The donation amount
   */
  const processDonation = async (amount) => {
    try {
      let paymentUrl

      // Use preset payment link if available
      if (DONATION_LINKS[amount]) {
        paymentUrl = DONATION_LINKS[amount]
      } else {
        // For custom amounts, use the pay-what-you-want link
        paymentUrl = CUSTOM_AMOUNT_LINK
      }

      // Open Stripe checkout in new window
      const stripeWindow = window.open(
        paymentUrl,
        'stripe-checkout',
        'width=600,height=600,scrollbars=yes,resizable=yes',
      )

      if (stripeWindow) {
        stripeWindow.focus()
      }

      // Show helpful message for custom amounts
      if (!DONATION_LINKS[amount]) {
        uiStore.showInfo(
          `Vous pourrez ajuster le montant (${amount}€) sur la page de paiement Stripe.`,
        )
      }
    } catch (error) {
      console.error('Error processing donation:', error)
      throw error
    }
  }

  /**
   * Handle donation submission
   */
  const handleDonation = async () => {
    if (!canDonate.value) return

    isProcessing.value = true

    try {
      await processDonation(selectedAmount.value)

      // Small delay for UX
      setTimeout(() => {
        isProcessing.value = false
      }, 1000)
    } catch (error) {
      console.error('Donation processing error:', error)
      uiStore.showError('Erreur lors du traitement du don. Veuillez réessayer.')
      isProcessing.value = false
    }
  }

  /**
   * Reset donation form to initial state
   */
  const resetDonation = () => {
    selectedAmount.value = 5
    customAmountInput.value = ''
    isProcessing.value = false
  }

  return {
    // State
    isProcessing,
    selectedAmount,
    customAmountInput,

    // Constants
    presetAmounts,

    // Computed
    canDonate,

    // Methods
    selectPresetAmount,
    handleCustomAmount,
    handleDonation,
    resetDonation,
  }
}
