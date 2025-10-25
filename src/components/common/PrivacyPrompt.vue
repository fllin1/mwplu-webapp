<template>
  <transition name="prefs-prompt">
    <div v-if="showPrompt" class="prefs-prompt">
      <div class="prefs-prompt__container">
        <div class="prefs-prompt__content">
          <div class="prefs-prompt__text">
            <h3>Gestion des cookies</h3>
            <p>
              Ce site utilise des cookies pour améliorer votre expérience de navigation et analyser l'utilisation du
              site. Certains cookies sont essentiels au fonctionnement du site, d'autres nécessitent votre
              consentement.
            </p>
          </div>
          <div class="prefs-prompt__actions">
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
        <router-link to="/policies/cookies" class="prefs-prompt__link">
          Plus d'informations
        </router-link>
      </div>
    </div>
  </transition>

  <!-- Preferences Modal -->
  <transition name="modal">
    <div v-if="showPreferencesModal" class="modal-backdrop" @click="hidePreferences">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Préférences des cookies</h3>
          <button @click="hidePreferences" class="modal-close">×</button>
        </div>
        <div class="modal-body">
          <div class="prefs-category">
            <div class="prefs-category__header">
              <h4>Cookies strictement nécessaires</h4>
              <input type="checkbox" checked disabled />
            </div>
            <p>Ces cookies sont indispensables au bon fonctionnement du site.</p>
          </div>

          <div class="prefs-category">
            <div class="prefs-category__header">
              <h4>Cookies de performance et d'analyse</h4>
              <input type="checkbox" v-model="preferences.analytics" id="analytics-pref" />
            </div>
            <p>Ces cookies nous aident à comprendre comment vous utilisez notre site pour l'améliorer.</p>
          </div>

          <div class="prefs-category">
            <div class="prefs-category__header">
              <h4>Cookies fonctionnels</h4>
              <input type="checkbox" v-model="preferences.functional" id="functional-pref" />
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
const showPrompt = ref(false)
const showPreferencesModal = ref(false)

// Debug mode - set to true to force prompt to show for testing
const DEBUG_FORCE_PROMPT = ref(false)

const preferences = reactive({
  analytics: false,
  functional: false,
})

// Preference storage
// New neutral key to avoid filters; migrate from the old key if present
const PREFS_KEY = 'mwplu_site_prefs'
const LEGACY_CONSENT_KEY = 'mwplu_cookie_consent'
const PREFS_VERSION = '1.0'

const readPrefs = () => {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return null
  try {
    const raw = localStorage.getItem(PREFS_KEY)
    return raw ? JSON.parse(raw) : null
  } catch (e) {
    return null
  }
}

const writePrefs = (data) => {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return
  localStorage.setItem(PREFS_KEY, JSON.stringify(data))
}

// Methods
const checkPreferenceStatus = () => {
  if (typeof window === 'undefined') return

  try {
    // Migrate legacy key if needed
    const legacy = localStorage.getItem(LEGACY_CONSENT_KEY)
    if (!localStorage.getItem(PREFS_KEY) && legacy) {
      try {
        const legacyData = JSON.parse(legacy)
        const migrated = {
          version: PREFS_VERSION,
          timestamp: new Date().toISOString(),
          analytics: !!legacyData.analytics,
          functional: !!legacyData.functional,
          essential: true,
        }
        writePrefs(migrated)

        // Apply analytics preference from legacy
        if (migrated.analytics) optIn()
        else optOut()

        showPrompt.value = false
        return
      } catch (e) {
        // fall through to showing the prompt
      }
    }

    const stored = readPrefs()
    if (!stored) {
      // Respect GPC by defaulting to opt-out, but still show the prompt
      const gpcEnabled = typeof navigator !== 'undefined' && navigator.globalPrivacyControl === true
      if (gpcEnabled) {
        preferences.analytics = false
        preferences.functional = false
        optOut()
      }
      showPrompt.value = true
      return
    }

    if (stored.version !== PREFS_VERSION) {
      showPrompt.value = true
      return
    }

    // Apply stored preferences
    preferences.analytics = !!stored.analytics
    preferences.functional = !!stored.functional
    if (stored.analytics) optIn()
    else optOut()
  } catch (error) {
    console.warn('Error reading site preferences:', error)
    showPrompt.value = true
  }
}

const savePrefs = (analytics = false, functional = false) => {
  if (typeof window === 'undefined') return
  try {
    const data = {
      version: PREFS_VERSION,
      timestamp: new Date().toISOString(),
      analytics,
      functional,
      essential: true,
    }

    writePrefs(data)

    if (analytics) optIn()
    else optOut()

    showPrompt.value = false
    showPreferencesModal.value = false
  } catch (error) {
    console.error('Error saving site preferences:', error)
  }
}

const acceptAll = () => savePrefs(true, true)
const rejectNonEssential = () => savePrefs(false, false)
const showPreferences = () => (showPreferencesModal.value = true)
const hidePreferences = () => (showPreferencesModal.value = false)
const savePreferences = () => savePrefs(preferences.analytics, preferences.functional)

// Initialize
onMounted(() => {
  if (DEBUG_FORCE_PROMPT.value) {
    showPrompt.value = true
    return
  }
  checkPreferenceStatus()
})
</script>

<style scoped>
/* Force these classes to be included in production builds */
.prefs-prompt,
.prefs-prompt__container,
.prefs-prompt__content,
.prefs-prompt__text,
.prefs-prompt__actions,
.prefs-prompt__link,
.modal-backdrop,
.modal-content,
.modal-header,
.modal-body,
.modal-footer,
.modal-close,
.prefs-category,
.prefs-category__header {
  /* Keep selectors */
}

.prefs-prompt {
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

.prefs-prompt__container {
  max-width: 1200px;
  margin: 0 auto;
}

.prefs-prompt__content {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 1rem;
}

.prefs-prompt__text {
  flex: 1;
}

.prefs-prompt__text h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-black);
}

.prefs-prompt__text p {
  margin: 0;
  font-size: 0.9rem;
  color: var(--color-gray-600);
  line-height: 1.4;
}

.prefs-prompt__actions {
  display: flex;
  gap: 0.75rem;
  flex-shrink: 0;
}

.prefs-prompt__link {
  display: inline-block;
  font-size: 0.85rem;
  color: var(--color-black);
  text-decoration: underline;
  transition: opacity 0.2s ease;
}

.prefs-prompt__link:hover {
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

.prefs-category {
  margin-bottom: 2rem;
}

.prefs-category:last-child {
  margin-bottom: 0;
}

.prefs-category__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.prefs-category__header h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-black);
}

.prefs-category__header input[type='checkbox'] {
  width: 18px;
  height: 18px;
  accent-color: var(--color-black);
}

.prefs-category p {
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
  .prefs-prompt {
    padding: 1rem;
  }

  .prefs-prompt__content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .prefs-prompt__actions {
    flex-direction: column;
    width: 100%;
    gap: 0.5rem;
  }

  .prefs-prompt__actions button {
    width: 100%;
  }

  .prefs-prompt__text {
    margin-bottom: 1rem;
  }

  .prefs-prompt__link {
    font-size: 0.875rem;
  }
}

/* Transition animations */
.prefs-prompt-enter-active,
.prefs-prompt-leave-active {
  transition: bottom 0.5s ease;
}

.prefs-prompt-enter-from,
.prefs-prompt-leave-to {
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
