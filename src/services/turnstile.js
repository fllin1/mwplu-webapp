// src/services/turnstile.js
/**
 * Turnstile Service Module
 * @module turnstile
 * @description This module handles the Cloudflare Turnstile CAPTCHA functionality.
 * It provides a method to validate Turnstile tokens on the backend.
 * It can be used in Vue components to integrate Turnstile CAPTCHA functionality.
 * @version 1.0.0
 * @author GreyPanda
 *
 * @changelog
 * - 1.0.0 (2025-06-02): Initial version with Turnstile validation functionality.
 */

export const turnstileService = {
  // Validate turnstile token on your backend
  async validateToken(token) {
    try {
      // This would typically be called by your Firebase function
      // but you can also implement client-side validation
      const response = await fetch('/api/validate-turnstile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      })

      const result = await response.json()
      return result.success
    } catch (error) {
      console.error('Turnstile validation error:', error)
      return false
    }
  },
}
