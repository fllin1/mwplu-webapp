<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import { dbService } from '@/services/supabase'
import AppLayout from '@/components/layout/AppLayout.vue'
import BaseSpinner from '@/components/common/BaseSpinner.vue'

// Composables
const router = useRouter()

// Local state
const isLoading = ref(false)
const errorMessage = ref('')
const cities = ref([])
const zonings = ref([])
const zones = ref([])

// Selection state
const selection = reactive({
  cityId: '',
  zoningId: '',
  zoneId: ''
})

// Computed
const canViewSynthesis = computed(() => {
  return selection.cityId && selection.zoningId && selection.zoneId
})

const cityPlaceholderText = computed(() => {
  return selection.cityId ? 'Sélectionnez un zonage' : "Sélectionnez d'abord une ville"
})

const zonePlaceholderText = computed(() => {
  return selection.zoningId ? 'Sélectionnez une zone' : "Sélectionnez d'abord un zonage"
})

// Methods
const loadCities = async () => {
  try {
    isLoading.value = true
    errorMessage.value = ''

    const result = await dbService.getCities()

    if (result.success) {
      cities.value = result.data
    } else {
      errorMessage.value = 'Erreur lors du chargement des communes'
    }
  } catch (error) {
    console.error('Error loading cities:', error)
    errorMessage.value = 'Une erreur inattendue s\'est produite'
  } finally {
    isLoading.value = false
  }
}

const onCityChange = async () => {
  if (!selection.cityId) {
    zonings.value = []
    zones.value = []
    selection.zoningId = ''
    selection.zoneId = ''
    return
  }

  try {
    isLoading.value = true
    errorMessage.value = ''
    selection.zoningId = ''
    selection.zoneId = ''
    zones.value = []

    const result = await dbService.getZonings(selection.cityId)

    if (result.success) {
      zonings.value = result.data
    } else {
      errorMessage.value = 'Erreur lors du chargement des zonages'
    }
  } catch (error) {
    console.error('Error loading zonings:', error)
    errorMessage.value = 'Une erreur inattendue s\'est produite'
  } finally {
    isLoading.value = false
  }
}

const onZoningChange = async () => {
  if (!selection.zoningId) {
    zones.value = []
    selection.zoneId = ''
    return
  }

  try {
    isLoading.value = true
    errorMessage.value = ''
    selection.zoneId = ''

    const result = await dbService.getZones(selection.zoningId)

    if (result.success) {
      zones.value = result.data
    } else {
      errorMessage.value = 'Erreur lors du chargement des zones'
    }
  } catch (error) {
    console.error('Error loading zones:', error)
    errorMessage.value = 'Une erreur inattendue s\'est produite'
  } finally {
    isLoading.value = false
  }
}

const onZoneChange = () => {
  errorMessage.value = ''
}

const viewPluSynthesis = () => {
  if (!canViewSynthesis.value) return

  // Navigate to PLU synthesis page with selection parameters
  router.push({
    name: 'plu-synthesis',
    query: {
      city: selection.cityId,
      zoning: selection.zoningId,
      zone: selection.zoneId
    }
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
onMounted(() => {
  loadCities()
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
            <label for="city-select" class="form-label">Ville</label>
            <select
              id="city-select"
              v-model="selection.cityId"
              class="form-select"
              :disabled="isLoading"
              @change="onCityChange"
            >
              <option value="">Sélectionnez une ville</option>
              <option
                v-for="city in cities"
                :key="city.id"
                :value="city.id"
              >
                {{ city.name }}
              </option>
            </select>
          </div>

          <!-- Zoning Selection -->
          <div class="grid-col-4 form-group">
            <label for="zoning-select" class="form-label">Zonage</label>
            <select
              id="zoning-select"
              v-model="selection.zoningId"
              class="form-select"
              :disabled="isLoading || !selection.cityId"
              @change="onZoningChange"
            >
              <option value="">{{ cityPlaceholderText }}</option>
              <option
                v-for="zoning in zonings"
                :key="zoning.id"
                :value="zoning.id"
              >
                {{ zoning.name }}
              </option>
            </select>
          </div>

          <!-- Zone Selection -->
          <div class="grid-col-4 form-group">
            <label for="zone-select" class="form-label">Zone</label>
            <select
              id="zone-select"
              v-model="selection.zoneId"
              class="form-select"
              :disabled="isLoading || !selection.zoningId"
              @change="onZoneChange"
            >
              <option value="">{{ zonePlaceholderText }}</option>
              <option
                v-for="zone in zones"
                :key="zone.id"
                :value="zone.id"
              >
                {{ zone.name }}
              </option>
            </select>
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
  margin-top: 4rem;
  padding: 7rem 0;
  margin-bottom: 3rem;
  overflow: hidden;
  text-align: center;
  background: var(--primary-white);
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
  mask: radial-gradient(ellipse 90% 90% at center, black 20%, transparent 80%);
  -webkit-mask: radial-gradient(ellipse 90% 90% at center, black 30%, transparent 80%);
}

.hero-section h2 {
  position: relative;
  z-index: 2;
  font-size: 2.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--primary-black);
}

.hero-section .lead {
  position: relative;
  z-index: 2;
}

.form-home {
  background: var(--primary-white);
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
