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
export function formatCityName(str) {
  if (!str) return ''
  return 'Métropole de ' + str.replace(/\b\w/g, (char) => char.toUpperCase())
}

/**
 * Converts a string to a URL-safe slug.
 * @param {string} str - The input string.
 * @returns {string} A URL-safe slug.
 */
export function createSlug(str) {
  if (!str) return ''
  return str
    .toLowerCase()
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[ç]/g, 'c')
    .replace(/[ñ]/g, 'n')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Converts a slug back to a readable string.
 * @param {string} slug - The URL slug.
 * @returns {string} A readable string.
 */
export function slugToString(slug) {
  if (!slug) return ''
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
}

/**
 * Finds an item by slug in an array.
 * @param {Array} items - Array of objects with name and id properties.
 * @param {string} slug - The slug to search for.
 * @returns {Object|null} The matching item or null.
 */
export function findBySlug(items, slug) {
  if (!items || !slug) return null
  return items.find((item) => createSlug(item.name) === slug) || null
}
