<template>
  <div class="plu-selection-container">
    <div v-if="errorMessage" class="status-message alert alert-info">
      {{ errorMessage }}
    </div>

    <!-- Step boxes -->
    <div class="steps">
      <div class="step" :class="{ active: activeStep >= 1 }">
        <div class="step-title">Étape 1</div>
        <div class="step-sub">Sélectionner la métropole</div>
      </div>
      <div class="step" :class="{ active: activeStep >= 2 }">
        <div class="step-title">Étape 2</div>
        <div class="step-sub">Indiquer l’adresse ou la zone d’intérêt</div>
      </div>
      <div class="step" :class="{ active: activeStep >= 3 }">
        <div class="step-title">Étape 3</div>
        <div class="step-sub">Consulter votre document</div>
      </div>
    </div>

    <!-- Form -->
    <form class="plu-selection-form" :class="formClass">
      <div class="layout-grid">
        <!-- Left column: selectors and address -->
        <div class="left-col">
          <!-- City Selection -->
          <div class="section">
            <h3 class="section-title">1. Sélectionner la métropole</h3>
            <CitySelector />
          </div>

          <!-- Address to Zone Section (always visible, disabled until city) -->
          <div class="section">
            <h3 class="section-title">2. Indiquer l'adresse</h3>
            <div class="address-lookup-section">
              <div class="address-row">
                <label for="address-input" class="form-label">Adresse</label>
                <div class="address-input-wrap">
                  <input id="address-input" v-model="address" type="text" class="form-input"
                    placeholder="Ex: 12 rue de la Paix" :disabled="!selectedCityId || isResolving"
                    @keydown.enter.prevent="handleFindZone" />
                  <button type="button" class="btn-secondary find-zone-btn" @click="handleFindZone"
                    :disabled="!selectedCityId || !address.trim() || isResolving">
                    <BaseSpinner v-if="isResolving" size="small" />
                    <span v-else>Trouver ma zone</span>
                  </button>
                </div>
                <small class="hint">
                  Besoin d'aide ? Consultez
                  <a href="https://www.geoportail.gouv.fr/" target="_blank">GeoPortail</a>.
                </small>
                <p v-if="zoneLabel" class="zone-label">Zone trouvée : <strong>{{ zoneLabel }}</strong></p>
                <p v-if="externalZoneLabel && !zoneLabel" class="zone-label">
                  Zone identifiée (IGN) : <strong>{{ externalZoneLabel }}</strong>. Sélectionnez-la
                  manuellement si disponible dans la liste des zones.
                </p>
                <p v-if="smartMatchNotice" class="zone-label" v-html="smartMatchNotice"></p>
                <p v-if="cityMismatch" class="city-mismatch">L'adresse indiquée ne semble pas se situer dans la
                  métropole sélectionnée.</p>
              </div>
            </div>
          </div>

          <!-- Zoning & Zone Selection -->
          <div class="section">
            <h4 class="font-weight-normal">Ou sélectionner directement une zone</h4>
            <div class="grid">
              <div class="grid-col form-group">
                <ZoningSelector />
              </div>
              <div class="grid-col form-group">
                <ZoneSelector />
              </div>
            </div>
          </div>

          <!-- Action Button -->
          <div class="action-row">
            <h3 class="section-title">3. Consulter votre document</h3>
            <button @click="handleViewSynthesis" :disabled="!canViewSynthesis || isLoading" class="to-plu-btn btn"
              type="button">
              <BaseSpinner v-if="isLoading" size="small" color="white" class="button-spinner" />
              {{ isLoading ? 'Chargement...' : buttonText }}
            </button>
          </div>
        </div>

        <!-- Right column: map preview -->
        <div class="right-col">
          <h3 class="section-title">Aperçu cartographique</h3>
          <div class="map-row">
            <Suspense>
              <component :is="MapPreviewAsync" :center="mapCenter" :polygon-geo-j-s-o-n="polygonGeoJSON" :marker="true"
                height="450px" :zoom="14" />
            </Suspense>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

import { usePluStore } from '@/stores/plu'
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui'
import { useAnalytics } from '@/composables/useAnalytics'

import BaseSpinner from '@/components/common/BaseSpinner.vue'
import CitySelector from '@/components/plu/CitySelector.vue'
import ZoningSelector from '@/components/plu/ZoningSelector.vue'
import ZoneSelector from '@/components/plu/ZoneSelector.vue'
import { defineAsyncComponent } from 'vue'
const MapPreviewAsync = defineAsyncComponent(() => import('@/components/plu/MapPreview.vue'))
import { useAddressToZone } from '@/composables/useAddressToZone'

// Props
const props = defineProps({
  buttonText: {
    type: String,
    default: 'Voir la synthèse'
  },
  variant: {
    type: String,
    default: 'home', // 'home' or 'search'
    validator: (value) => ['home', 'search'].includes(value)
  }
})

// Composables
const router = useRouter()
const route = useRoute()
const pluStore = usePluStore()
const authStore = useAuthStore()
const uiStore = useUIStore()
const { trackEvent } = useAnalytics()
const { findZoneForAddress, isLoading: isResolving } = useAddressToZone()

// Computed
const isLoading = computed(() => pluStore.isLoading)
const errorMessage = computed(() => pluStore.error)
const canViewSynthesis = computed(() => pluStore.canViewSynthesis)
const isAuthenticated = computed(() => authStore.isAuthenticated)
const selectedCityId = computed(() => pluStore.selectedCityId)
const selectedCity = computed(() => pluStore.selectedCity)

const formClass = computed(() => {
  return props.variant === 'home' ? 'form-home' : 'form-search'
})

// Steps: simple indicator based on current selection progress
const activeStep = computed(() => {
  if (pluStore.selectedCityId && pluStore.selectedZoningId && pluStore.selectedZoneId) return 3
  if (pluStore.selectedCityId) return 2
  return 1
})

// Address lookup state
const address = ref('')
const zoneLabel = ref('')
const externalZoneLabel = ref('')
const smartMatchNotice = ref('')
const mapCenter = ref(null)
const polygonGeoJSON = ref(null)
const resolvedCity = ref('')
const cityMismatch = ref(false)

const handleFindZone = async () => {
  if (!address.value.trim() || !selectedCity.value) return
  zoneLabel.value = ''
  externalZoneLabel.value = ''
  smartMatchNotice.value = ''
  polygonGeoJSON.value = null
  mapCenter.value = null

  const cityName = selectedCity.value.name
  const cityId = selectedCityId.value
  const result = await findZoneForAddress(address.value, cityName, cityId)

  if (!result?.success) {
    if (result?.reason === 'ZONE_NOT_FOUND') {
      if (result?.zone?.libelle) {
        externalZoneLabel.value = result.zone.libelle
      }
    }

    const message =
      result?.reason === 'GEOCODING_FAILED'
        ? "Échec de la géolocalisation de l’adresse (BAN). Essayez de préciser le numéro et la voie."
        : result?.reason === 'ZONE_LOOKUP_FAILED'
          ? 'Zone urbaine introuvable à cette position (IGN). Essayez une adresse proche.'
          : result?.reason === 'ZONE_NOT_FOUND'
            ? `Zone trouvée (IGN) mais non reconnue pour cette métropole.${externalZoneLabel.value ? ` (IGN: ${externalZoneLabel.value})` : ''}`
            : 'Recherche de zone impossible.'
    uiStore.showError(message)
    return
  }

  // no-op: handled via keydown on input to avoid unused function

  // Update map preview
  mapCenter.value = { lat: result.geo.lat, lon: result.geo.lon }
  resolvedCity.value = result.geo.cityLabel || ''
  cityMismatch.value = !!(resolvedCity.value && selectedCity.value && resolvedCity.value.toLowerCase() !== selectedCity.value.name.toLowerCase())
  if (result.zone?.geometry) {
    polygonGeoJSON.value = result.zone.geometry
  }

  // Update selection by IDs
  try {
    await pluStore.selectCity(cityId)
    await pluStore.selectZoning(result.match.zoningId)
    pluStore.selectZone(result.match.zoneId)
    zoneLabel.value = result.match.zoneName
    // If smart match was used, warn the user
    if (result.match.usedSmartMatch) {
      const msg = `<span style="text-decoration: underline;">Correspondance approximative utilisée</span>: la zone IGN "<strong>${externalZoneLabel.value || result.zone?.libelle}</strong>" a été associée à la zone "${zoneLabel.value}".`
      smartMatchNotice.value = msg
      const msg_raw = `Correspondance approximative utilisée: la zone IGN "${externalZoneLabel.value || result.zone?.libelle}" a été associée à la zone "${zoneLabel.value}".`
      uiStore.showInfo(msg_raw)
      // Persist for the next page
      pluStore.setSmartMatch({
        usedSmartMatch: true,
        externalZoneLabel: externalZoneLabel.value || result.zone?.libelle || '',
        internalZoneName: result.match.zoneName,
      })
    }
    trackEvent('zone_resolved', {
      city_id: cityId,
      zone_name: result.match.zoneName,
    })
  } catch (e) {
    console.error('Failed to apply selection from address:', e)
    uiStore.showError('Sélection de zone impossible.')
  }
}

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
const handleViewSynthesis = () => {
  if (!canViewSynthesis.value) return

  const slugs = pluStore.getSelectionSlugs()
  if (!slugs) return

  // Track analytics event
  trackEvent('plu_synthesis_access', {
    city_name: pluStore.selectedCity?.name,
    zoning_name: pluStore.selectedZoning?.name,
    zone_name: pluStore.selectedZone?.name,
    city_id: pluStore.selectedCityId,
    zoning_id: pluStore.selectedZoningId,
    zone_id: pluStore.selectedZoneId,
    source_page: props.variant
  })

  // Navigate to PLU synthesis page with slug-based parameters
  router.push({
    name: 'plu-synthesis',
    params: {
      city: slugs.city,
      zoning: slugs.zoning,
      zone: slugs.zone,
    }
  })
}

// Initialize
onMounted(async () => {
  // Initialize PLU store (loads cities)
  await pluStore.initializeSelection()

  // Handle preselection from breadcrumb navigation
  const { preselect, city, zoning } = route.query
  if (preselect && city) {
    if (preselect === 'city') {
      await pluStore.selectCity(city)
    } else if (preselect === 'zoning' && zoning) {
      await pluStore.selectCity(city)
      await pluStore.selectZoning(zoning)
    }
  }
})
</script>

<style scoped>
.plu-selection-container {
  width: 100%;
}

.status-message {
  margin-bottom: var(--space-6);
  padding: var(--space-4);
  border-radius: var(--radius-card);
  border: 1px solid var(--color-blue-200);
  background-color: var(--color-blue-50);
  color: var(--color-blue-700);
}

/* Step boxes */
.steps {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 24px;
}

.step {
  background: #fff;
  border: 1px solid var(--color-gray-200);
  text-align: center;
  padding: 12px 8px;
  border-radius: 4px;
  color: var(--color-gray-500);
}

.step .step-title {
  font-weight: 600;
  margin-bottom: 4px;
}

.step.active {
  color: var(--color-gray-900);
  border-color: var(--color-gray-300);
}

/* Form card */
.form-home,
.form-search {
  background: #fff;
  border-radius: 4px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid var(--color-gray-200);
  margin-bottom: 3rem;
}

.form-label {
  margin-bottom: 0;
}

.layout-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.left-col,
.right-col {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-title {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-gray-900);
}

.section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.address-lookup-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.address-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 4px;
}

.address-input-wrap {
  display: flex;
  gap: var(--space-2);
  align-items: center;
}



.find-zone-btn {
  white-space: nowrap;
}

.zone-label {
  margin: 0;
  color: var(--color-gray-800);
}

.city-mismatch {
  color: #b45309;
  background: #fffbeb;
  border: 1px solid #fcd34d;
  padding: 8px;
  border-radius: 4px;
}

.map-row {
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-card);
  overflow: hidden;
}

.action-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action-row .to-plu-btn {
  width: 100%;
}

/* Responsive Design */
@media (max-width: 768px) {

  .form-home,
  .form-search {
    padding: 16px;
  }

  .layout-grid {
    grid-template-columns: 1fr;
  }
}
</style>
