// src/utils/constants.js
/**
 * Constants Module
 * @module constants
 * @description This module defines application-wide constants used throughout the application.
 * It includes application name, URLs, storage keys, Supabase table names, file upload limits, and pagination settings.
 * It can be imported in any Vue component or service to access these constants.
 * @version 1.0.0
 * @author GreyPanda
 *
 * @changelog
 * - 1.0.0 (2025-06-02): Initial version with basic constants.
 */

export const APP_CONSTANTS = {
  APP_NAME: import.meta.env.VITE_APP_NAME || 'MWPLU',
  APP_URL: import.meta.env.VITE_APP_URL || 'http://localhost:5173',

  STORAGE_KEYS: {
    THEME: 'mwplu_theme',
    LANGUAGE: 'mwplu_language',
    LAST_SELECTED_CITY: 'mwplu_last_city',
    LAST_SELECTED_ZONING: 'mwplu_last_zoning',
  },

  TURNSTILE: {
    SITE_KEY: import.meta.env.VITE_TURNSTILE_SITE_KEY,
  },

  ROUTES: {
    HOME: '/',
    LOGIN: '/login',
    SIGNUP: '/signup',
    PROFILE: '/profile',
    PLU_SYNTHESIS: '/plu-synthesis',
    CONTACT: '/contact',
    RESET_PASSWORD: '/reset-password',
  },

  // Supabase table names (adjust to match your actual table names)
  TABLES: {
    CITIES: 'cities',
    ZONINGS: 'zonings',
    ZONES: 'zones',
    TYPOLOGIES: 'typologies',
    DOCUMENTS: 'documents',
    COMMENTS: 'comments',
    RATINGS: 'ratings',
    DOWNLOADS: 'downloads',
    CONTACT_MESSAGES: 'contact_messages',
    USER_PROFILES: 'user_profiles',
  },

  // File upload limits
  UPLOAD: {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'application/pdf'],
  },

  // Pagination
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
  },
}
