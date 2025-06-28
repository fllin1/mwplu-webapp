/**
 * Policy Content Composable
 * @module usePolicyContent
 * @description Vue composable for easy policy content management
 * @version 1.0.0
 *
 * Features:
 * - Reactive loading states
 * - Error handling with retry functionality
 * - Multiple content formats (full, modal)
 * - Caching for performance
 * - TypeScript-friendly
 *
 * Usage:
 * ```js
 * import { usePolicyContent } from '@/composables/usePolicyContent'
 *
 * // In component setup
 * const { content, isLoading, error, loadPolicy, retry } = usePolicyContent()
 *
 * // Load terms for modal
 * await loadPolicy('terms', 'modal')
 *
 * // Or load privacy for full page
 * await loadPolicy('privacy', 'full')
 * ```
 */

import { ref, reactive } from 'vue'
import { policyService, POLICY_TYPES, CONTENT_FORMATS } from '@/services/policyService'

// Global cache to avoid re-loading the same content
const contentCache = reactive({})

/**
 * Policy content composable
 * @param {Object} options - Configuration options
 * @returns {Object} Reactive policy content state and methods
 */
export function usePolicyContent(options = {}) {
  // Reactive state
  const content = ref('')
  const isLoading = ref(false)
  const error = ref(null)
  const metadata = ref(null)
  const lastLoadedType = ref(null)
  const lastLoadedFormat = ref(null)

  // Configuration
  const { autoRetry = false, cacheEnabled = true } = options

  /**
   * Generate cache key for content
   * @param {string} policyType - Policy type
   * @param {string} format - Content format
   * @returns {string} Cache key
   */
  const getCacheKey = (policyType, format) => `${policyType}-${format}`

  /**
   * Load policy content
   * @param {string} policyType - Type of policy (terms, privacy, etc.)
   * @param {string} format - Content format (full, modal)
   * @returns {Promise<boolean>} Success status
   */
  const loadPolicy = async (policyType, format = CONTENT_FORMATS.FULL) => {
    try {
      isLoading.value = true
      error.value = null

      // Validate inputs
      if (!policyType) {
        throw new Error('Policy type is required')
      }

      if (!Object.values(POLICY_TYPES).includes(policyType)) {
        throw new Error(`Invalid policy type: ${policyType}`)
      }

      if (!Object.values(CONTENT_FORMATS).includes(format)) {
        throw new Error(`Invalid content format: ${format}`)
      }

      // Check cache first
      const cacheKey = getCacheKey(policyType, format)
      if (cacheEnabled && contentCache[cacheKey]) {
        content.value = contentCache[cacheKey].content
        metadata.value = contentCache[cacheKey].metadata
        lastLoadedType.value = policyType
        lastLoadedFormat.value = format
        return true
      }

      // Load content from service
      const htmlContent = policyService.getPolicyHTML(policyType, format)
      const policyMetadata = policyService.getPolicyMetadata(policyType)

      if (!htmlContent) {
        throw new Error(`Failed to load ${policyType} policy content in ${format} format`)
      }

      // Update reactive state
      content.value = htmlContent
      metadata.value = policyMetadata
      lastLoadedType.value = policyType
      lastLoadedFormat.value = format

      // Cache the content
      if (cacheEnabled) {
        contentCache[cacheKey] = {
          content: htmlContent,
          metadata: policyMetadata,
          timestamp: Date.now(),
        }
      }

      return true
    } catch (err) {
      console.error('Policy content loading error:', err)
      error.value = err.message || 'Failed to load policy content'

      // Auto-retry if enabled
      if (autoRetry && !error.value.includes('Invalid')) {
        setTimeout(() => retry(), 2000)
      }

      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Retry loading the last requested policy content
   * @returns {Promise<boolean>} Success status
   */
  const retry = async () => {
    if (lastLoadedType.value && lastLoadedFormat.value) {
      return await loadPolicy(lastLoadedType.value, lastLoadedFormat.value)
    }
    return false
  }

  /**
   * Clear content and reset state
   */
  const clear = () => {
    content.value = ''
    metadata.value = null
    error.value = null
    lastLoadedType.value = null
    lastLoadedFormat.value = null
  }

  /**
   * Check if policy exists
   * @param {string} policyType - Policy type to check
   * @returns {boolean} Whether policy exists
   */
  const policyExists = (policyType) => {
    return policyService.policyExists(policyType)
  }

  /**
   * Get available policy types
   * @returns {Array} Available policy types
   */
  const getAvailablePolicies = () => {
    return policyService.getAvailablePolicies()
  }

  /**
   * Search within loaded policy content
   * @param {string} searchTerm - Term to search for
   * @returns {Array} Matching sections
   */
  const searchContent = (searchTerm) => {
    if (!lastLoadedType.value || !searchTerm) {
      return []
    }
    return policyService.searchPolicyContent(lastLoadedType.value, searchTerm)
  }

  /**
   * Clear cache for specific policy or all policies
   * @param {string} policyType - Optional policy type to clear
   * @param {string} format - Optional format to clear
   */
  const clearCache = (policyType = null, format = null) => {
    if (policyType && format) {
      const cacheKey = getCacheKey(policyType, format)
      delete contentCache[cacheKey]
    } else if (policyType) {
      Object.keys(contentCache)
        .filter((key) => key.startsWith(policyType))
        .forEach((key) => delete contentCache[key])
    } else {
      Object.keys(contentCache).forEach((key) => delete contentCache[key])
    }
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  const getCacheStats = () => {
    const entries = Object.keys(contentCache)
    return {
      totalEntries: entries.length,
      entries: entries,
      totalSize: JSON.stringify(contentCache).length,
    }
  }

  return {
    // Reactive state
    content,
    isLoading,
    error,
    metadata,
    lastLoadedType,
    lastLoadedFormat,

    // Methods
    loadPolicy,
    retry,
    clear,
    policyExists,
    getAvailablePolicies,
    searchContent,
    clearCache,
    getCacheStats,

    // Constants for convenience
    POLICY_TYPES,
    CONTENT_FORMATS,
  }
}

export default usePolicyContent
