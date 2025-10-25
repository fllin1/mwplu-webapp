/**
 * Policy Content Service
 * @module policyService
 * @description Centralized service for managing all policy content
 * @version 1.0.0
 *
 * Features:
 * - Single source of truth for all policy content
 * - Multiple content formats (full, modal)
 * - Easy maintenance and updates
 * - Consistent formatting across components
 *
 * Design Principles:
 * - DRY (Don't Repeat Yourself)
 * - Separation of concerns
 * - Easy extensibility for new policies
 * - Type-safe content structure
 */

import { termsContent } from '@/content/policies/termsContent'
import { privacyContent } from '@/content/policies/privacyContent'

/**
 * Policy types available
 */
export const POLICY_TYPES = {
  TERMS: 'terms',
  PRIVACY: 'privacy',
  COOKIES: 'cookies',
  LEGAL: 'legal',
}

/**
 * Policy content registry
 */
const POLICY_REGISTRY = {
  [POLICY_TYPES.TERMS]: termsContent,
  [POLICY_TYPES.PRIVACY]: privacyContent,
  // Add more policies here as needed
  // [POLICY_TYPES.COOKIES]: cookiesContent,
  // [POLICY_TYPES.LEGAL]: legalContent,
}

/**
 * Get policy content
 * @param {string} policyType - Type of policy (terms, privacy, etc.)
 * @returns {Object|null} Policy content or null if not found
 */
export function getPolicyContent(policyType) {
  const policy = POLICY_REGISTRY[policyType]

  if (!policy) {
    console.error(`Policy type "${policyType}" not found`)
    return null
  }

  try {
    // Since modal and full content are identical, always use full content
    return policy.getFullContent()
  } catch (error) {
    console.error(`Error getting policy content:`, error)
    return null
  }
}

/**
 * Get formatted HTML content for display
 * @param {string} policyType - Type of policy
 * @returns {string} HTML content ready for display
 */
export function getPolicyHTML(policyType) {
  const content = getPolicyContent(policyType)

  if (!content) {
    return "<p>Le contenu n'a pas pu être chargé.</p>"
  }

  return generatePolicyHTML(content)
}

/**
 * Generate HTML for policy display (unified for both modal and full page)
 * @param {Object} content - Policy content object
 * @returns {string} HTML string for display
 */
function generatePolicyHTML(content) {
  const sectionsHTML = content.sections
    .map(
      (section) => `
      <div class="article" id="${section.id}">
        <h2>${section.title}</h2>
        ${section.content}
      </div>
    `,
    )
    .join('')

  return `
    <h1>${content.title}</h1>
    <div class="last-update">Dernière mise à jour : ${content.lastUpdate}</div>
    ${sectionsHTML}
  `
}

/**
 * Get available policy types
 * @returns {Array} Array of available policy types
 */
export function getAvailablePolicies() {
  return Object.keys(POLICY_REGISTRY)
}

/**
 * Check if policy type exists
 * @param {string} policyType - Policy type to check
 * @returns {boolean} Whether policy exists
 */
export function policyExists(policyType) {
  return policyType in POLICY_REGISTRY
}

/**
 * Get policy metadata
 * @param {string} policyType - Type of policy
 * @returns {Object|null} Policy metadata or null
 */
export function getPolicyMetadata(policyType) {
  const policy = POLICY_REGISTRY[policyType]
  return policy ? policy.metadata : null
}

/**
 * Register a new policy content
 * @param {string} policyType - Type of policy to register
 * @param {Object} policyContent - Policy content object
 */
export function registerPolicy(policyType, policyContent) {
  POLICY_REGISTRY[policyType] = policyContent
}

/**
 * Search within policy content
 * @param {string} policyType - Type of policy to search
 * @param {string} searchTerm - Term to search for
 * @returns {Array} Array of matching sections
 */
export function searchPolicyContent(policyType, searchTerm) {
  const content = getPolicyContent(policyType)

  if (!content || !searchTerm) {
    return []
  }

  const term = searchTerm.toLowerCase()

  return content.sections.filter((section) => {
    return (
      section.title.toLowerCase().includes(term) || section.content.toLowerCase().includes(term)
    )
  })
}

// Export the service object for easier testing and modularity
export const policyService = {
  getPolicyContent,
  getPolicyHTML,
  getAvailablePolicies,
  policyExists,
  getPolicyMetadata,
  registerPolicy,
  searchPolicyContent,
  POLICY_TYPES,
}

export default policyService
