// Firebase configuration and Analytics setup
import { initializeApp } from 'firebase/app'
import { getAnalytics, logEvent, setUserId, setUserProperties } from 'firebase/analytics'

// Firebase configuration
const firebaseConfig = {
  projectId: 'mwplu-webapp',
  appId: '1:411919172885:web:d59065e0677de3e8bdd51c',
  storageBucket: 'mwplu-webapp.firebasestorage.app',
  apiKey: 'AIzaSyBWSt4ZPTTRl5tmAhfUKZ79R0girj8mySc',
  authDomain: 'mwplu-webapp.firebaseapp.com',
  messagingSenderId: '411919172885',
  measurementId: 'G-FP4E0W6S41',
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Analytics
let analytics = null
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app)
}

// Analytics helper functions
export const trackEvent = (eventName, parameters = {}) => {
  if (analytics) {
    logEvent(analytics, eventName, parameters)
  }
}

export const setAnalyticsUserId = (userId) => {
  if (analytics) {
    setUserId(analytics, userId)
  }
}

export const setAnalyticsUserProperties = (properties) => {
  if (analytics) {
    setUserProperties(analytics, properties)
  }
}

// Export Firebase services
export { app, analytics }
