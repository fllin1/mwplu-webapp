<template>
  <transition name="cookie-banner">
    <div v-if="showBanner" class="cookie-banner">
      <div class="cookie-banner__container">
        <div class="cookie-banner__content">
          <div class="cookie-banner__text">
            <h3>Gestion des cookies</h3>
            <p>
              Ce site utilise des cookies pour améliorer votre expérience de navigation et analyser l'utilisation du
              site.
              Certains cookies sont essentiels au fonctionnement du site, d'autres nécessitent votre consentement.
            </p>
          </div>
          <div class="cookie-banner__actions">
            <button @click="acceptAll" class="btn btn-primary">
              Tout accepter
            </button>
            <button @click="rejectNonEssential" class="btn btn-secondary">
              Refuser les non-essentiels
            </button>
            <button @click="showPreferences" class="btn btn-outline">
              Personnaliser
            </button>
          </div>
        </div>
        <router-link to="/policies/cookies" class="cookie-banner__link">
          Plus d'informations
        </router-link>
      </div>
    </div>
  </transition>

  <!-- Cookie Preferences Modal -->
  <transition name="modal">
    <div v-if="showPreferencesModal" class="modal-backdrop" @click="hidePreferences">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Préférences des cookies</h3>
          <button @click="hidePreferences" class="modal-close">×</button>
        </div>
        <div class="modal-body">
          <div class="cookie-category">
            <div class="cookie-category__header">
              <h4>Cookies strictement nécessaires</h4>
              <input type="checkbox" checked disabled />
            </div>
            <p>Ces cookies sont indispensables au bon fonctionnement du site.</p>
          </div>

          <div class="cookie-category">
            <div class="cookie-category__header">
              <h4>Cookies de performance et d'analyse</h4>
              <input type="checkbox" v-model="preferences.analytics" id="analytics-cookies" />
            </div>
            <p>Ces cookies nous aident à comprendre comment vous utilisez notre site pour l'améliorer.</p>
          </div>

          <div class="cookie-category">
            <div class="cookie-category__header">
              <h4>Cookies fonctionnels</h4>
              <input type="checkbox" v-model="preferences.functional" id="functional-cookies" />
            </div>
            <p>Ces cookies mémorisent vos préférences pour une meilleure expérience utilisateur.</p>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="savePreferences" class="btn btn-primary">
            Enregistrer mes préférences
          </button>
          <button @click="hidePreferences" class="btn btn-secondary">
            Annuler
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useAnalytics } from '@/composables/useAnalytics'

const { optIn, optOut } = useAnalytics()

// State
const showBanner = ref(false)
const showPreferencesModal = ref(false)

// Debug mode - set to true to force banner to show for testing
const DEBUG_FORCE_BANNER = ref(false) // Set to true to test in production

const preferences = reactive({
  analytics: false,
  functional: false
})

// Cookie consent management
const CONSENT_KEY = 'mwplu_cookie_consent'
const CONSENT_VERSION = '1.0'

// Methods
const checkConsentStatus = () => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return
  }

  try {
    const consent = localStorage.getItem(CONSENT_KEY)
    if (!consent) {
      showBanner.value = true
      return
    }

    const consentData = JSON.parse(consent)
    if (consentData.version !== CONSENT_VERSION) {
      showBanner.value = true
      return
    }

    // Apply stored preferences
    if (consentData.analytics) {
      optIn()
    } else {
      optOut()
    }
    
    console.log('🍪 Cookie consent loaded:', consentData)
  } catch (error) {
    console.warn('Error reading cookie consent:', error)
    showBanner.value = true
    console.log('🍪 Cookie banner will show due to error or missing consent')
  }
}

const saveConsent = (analytics = false, functional = false) => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return
  }

  try {
    const consentData = {
      version: CONSENT_VERSION,
      timestamp: new Date().toISOString(),
      analytics,
      functional,
      essential: true // Always true
    }

    localStorage.setItem(CONSENT_KEY, JSON.stringify(consentData))

    // Apply analytics settings
    if (analytics) {
      optIn()
    } else {
      optOut()
    }

    showBanner.value = false
    showPreferencesModal.value = false
  } catch (error) {
    console.error('Error saving cookie consent:', error)
  }
}

const acceptAll = () => {
  saveConsent(true, true)
}

const rejectNonEssential = () => {
  saveConsent(false, false)
}

const showPreferences = () => {
  showPreferencesModal.value = true
}

const hidePreferences = () => {
  showPreferencesModal.value = false
}

const savePreferences = () => {
  saveConsent(preferences.analytics, preferences.functional)
}

// Initialize
onMounted(() => {
  // Force banner for debugging (remove this in final version)
  if (DEBUG_FORCE_BANNER.value) {
    showBanner.value = true
    console.log('🍪 Cookie banner forced to show for debugging')
    return
  }
  
  checkConsentStatus()
})
</script>

<style scoped>
/* Force these classes to be included in production builds */
.cookie-banner,
.cookie-banner__container,
.cookie-banner__content,
.cookie-banner__text,
.cookie-banner__actions,
.cookie-banner__link,
.modal-backdrop,
.modal-content,
.modal-header,
.modal-body,
.modal-footer,
.modal-close,
.cookie-category,
.cookie-category__header {
  /* This comment ensures these selectors are preserved in production builds */
}

.cookie-banner {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--color-white);
  border-top: 2px solid var(--color-gray-200);
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.1);
  z-index: 10001;
  padding: 2rem 1rem;
  max-height: 50vh;
  overflow-y: auto;
}

.cookie-banner__container {
  max-width: 1200px;
  margin: 0 auto;
}

.cookie-banner__content {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 1rem;
}

.cookie-banner__text {
  flex: 1;
}

.cookie-banner__text h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-black);
}

.cookie-banner__text p {
  margin: 0;
  font-size: 0.9rem;
  color: var(--color-gray-600);
  line-height: 1.4;
}

.cookie-banner__actions {
  display: flex;
  gap: 0.75rem;
  flex-shrink: 0;
}

.cookie-banner__link {
  display: inline-block;
  font-size: 0.85rem;
  color: var(--color-black);
  text-decoration: underline;
  transition: opacity 0.2s ease;
}

.cookie-banner__link:hover {
  opacity: 0.7;
}

/* Modal styles */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10002;
  padding: 2rem;
}

.modal-content {
  background: var(--color-white);
  border-radius: 4px;
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--color-gray-200);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-black);
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--color-gray-600);
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 2px;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: var(--color-gray-200);
  color: var(--color-black);
}

.modal-body {
  padding: 1.5rem;
}

.cookie-category {
  margin-bottom: 2rem;
}

.cookie-category:last-child {
  margin-bottom: 0;
}

.cookie-category__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.cookie-category__header h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-black);
}

.cookie-category__header input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: var(--color-black);
}

.cookie-category p {
  margin: 0;
  font-size: 0.9rem;
  color: var(--color-gray-600);
  line-height: 1.4;
}

.modal-footer {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid var(--color-gray-200);
  justify-content: flex-end;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .cookie-banner {
    padding: 1rem;
  }

  .cookie-banner__content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .cookie-banner__actions {
    flex-direction: column;
    width: 100%;
    gap: 0.5rem;
  }

  .cookie-banner__actions button {
    width: 100%;
  }

  .cookie-banner__text {
    margin-bottom: 1rem;
  }

  .cookie-banner__link {
    font-size: 0.875rem;
  }
}

/* Transition animations */
.cookie-banner-enter-active,
.cookie-banner-leave-active {
  transition: bottom 0.5s ease;
}

.cookie-banner-enter-from,
.cookie-banner-leave-to {
  bottom: -100%;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
