/**
 * Helper Functions Module
 * @module helpers
 * @description This module provides various utility functions used throughout the application.
 * @version 1.0.0
 * @author GreyPanda
 */

/**
 * Capitalizes the first letter of each word in a string.
 * @param {string} str - The input string.
 * @returns {string} The string with the first letter of each word capitalized.
 */
export function capitalizeWords(str) {
  if (!str) return ''
  return str.replace(/\b\w/g, (char) => 'Métropole de ' + char.toUpperCase())
}
