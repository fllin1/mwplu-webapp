<script setup>
import { computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'

import { usePluStore } from '@/stores/plu'
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui'
import { useAnalytics } from '@/composables/useAnalytics'
import AppLayout from '@/components/layout/AppLayout.vue'
import BaseSpinner from '@/components/common/BaseSpinner.vue'
import CitySelector from '@/components/plu/CitySelector.vue'
import ZoningSelector from '@/components/plu/ZoningSelector.vue'
import ZoneSelector from '@/components/plu/ZoneSelector.vue'

// Composables
const router = useRouter()
const pluStore = usePluStore()
const authStore = useAuthStore()
const uiStore = useUIStore()
const { trackEvent } = useAnalytics()

// Computed
const isLoading = computed(() => pluStore.isLoading)
const errorMessage = computed(() => pluStore.error)
const canViewSynthesis = computed(() => pluStore.canViewSynthesis)
const isAuthenticated = computed(() => authStore.isAuthenticated)

// Watch for selection changes to prompt login
watch(
  () => pluStore.selectedCityId,
  (newCityId) => {
    if (newCityId && !isAuthenticated.value) {
      uiStore.showInfo(
        'Veuillez vous connecter pour accéder aux synthèses de PLU.',
        'La connexion est requise pour accéder aux synthèses de PLU.'
      )
    }
  }
)

// Methods
const viewPluSynthesis = () => {
  if (!canViewSynthesis.value) return

  const params = pluStore.getSelectionParams()
  if (!params) return

  // Track analytics event
  trackEvent('plu_synthesis_access', {
    city_name: pluStore.selectedCity?.name,
    zoning_name: pluStore.selectedZoning?.name,
    zone_name: pluStore.selectedZone?.name,
    ...params
  })

  // Navigate to PLU synthesis page with selection parameters
  router.push({
    name: 'plu-synthesis',
    query: params
  })
}

// Typewriter effect logic
function applyTypewriterEffect(element, text, speed) {
  let i = 0;
  element.innerHTML = ""; // Ensure the element is empty

  const textSpan = document.createElement("span");
  element.appendChild(textSpan);

  textSpan.style.borderRight = "2px solid var(--color-gray-500, #888)";
  textSpan.style.paddingRight = "2px";
  textSpan.style.whiteSpace = "nowrap";

  const pausePoint = Math.floor(text.length * 0.6); // 60% of the text
  let hasPaused = false;

  function type() {
    if (i < text.length) {
      textSpan.textContent += text.charAt(i);
      i++;
      // Add pause at 60% of the writing
      if (i === pausePoint && !hasPaused) {
        hasPaused = true;
        setTimeout(type, 300); // 300ms pause (adjust as needed)
      } else {
        setTimeout(type, speed);
      }
    } else {
      textSpan.style.borderRight = "none";
      textSpan.style.paddingRight = "0";
    }
  }

  // Initial 0.5 second delay before starting to type
  setTimeout(type, 500);
}

// Initialize
onMounted(async () => {
  // Initialize PLU store (loads cities)
  await pluStore.initializeSelection()

  // Typewriter effect
  const subtitleElement = document.getElementById("typewriter-subtitle");
  const textToType = "MWPLU - 2025";
  const typingSpeed = 85;

  if (subtitleElement) {
    applyTypewriterEffect(subtitleElement, textToType, typingSpeed);
  }
})
</script>

<template>
  <AppLayout>
  <main class="main-content">
    <section class="hero-section text-center">
      <h2 class="animate-title margin-bottom-md">Répertoire des synthèses de PLU</h2>
      <p class="lead" id="typewriter-subtitle"></p>
    </section>

    <div class="container">
      <div id="statusMessage" class="status-message alert alert-info" v-if="errorMessage">
        {{ errorMessage }}
      </div>

      <form class="margin-bottom-lg form-home">
        <div class="grid">
          <!-- City Selection -->
          <div class="grid-col-4 form-group">
            <CitySelector />
          </div>

          <!-- Zoning Selection -->
          <div class="grid-col-4 form-group">
            <ZoningSelector />
          </div>

          <!-- Zone Selection -->
          <div class="grid-col-4 form-group">
            <ZoneSelector :show-summary="false" />
          </div>
        </div>

        <!-- Action Button -->
        <div class="text-center margin-top-lg margin-bottom-sm">
          <button
            @click="viewPluSynthesis"
            :disabled="!canViewSynthesis || isLoading"
            class="to-plu-btn btn"
          >
            <BaseSpinner
              v-if="isLoading"
              size="small"
              color="white"
              class="button-spinner"
            />
            {{ isLoading ? 'Chargement...' : 'Voir la synthèse' }}
          </button>
        </div>
      </form>
    </div>
  </main>
  </AppLayout>
</template>

<style scoped>
.main-content {
  max-width: 1920px;
  margin: 0 auto;
  padding: 1rem 1.5rem;
}

.hero-section {
  position: relative;
  width: 100vw;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
  padding: 7rem 0;
  margin-bottom: 3rem;
  overflow: hidden;
  text-align: center;
  background: var(--color-white);
}

.hero-section::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, var(--accent-gray) 1px, transparent 1px) 0 0,
              linear-gradient(var(--accent-gray) 1px, transparent 1px) 0 0;
  background-size: 20px 20px;
  z-index: 1;
  opacity: 0.5;
  mask: radial-gradient(ellipse 90% 80% at center, black 20%, transparent 80%);
  -webkit-mask: radial-gradient(ellipse 90% 80% at center, black 30%, transparent 80%);
}

.hero-section h2 {
  position: relative;
  z-index: 2;
  font-size: 2.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--color-black);
}

.hero-section .lead {
  position: relative;
  z-index: 2;
}

.form-home {
  background: var(--color-white);
  border-radius: 4px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 3rem;
}

/* Responsive for Home page elements */
@media (max-width: 768px) {
  .main-content {
    padding: 1.5rem;
  }

  .hero-section {
    padding: 3rem 1rem;
  }

  .hero-section h2 {
    font-size: 2rem;
  }

  .lead {
    font-size: 1.3rem;
  }

  .container form {
    margin: 0 1rem;
  }

  .grid {
    gap: 1.5rem;
  }
}
</style>
