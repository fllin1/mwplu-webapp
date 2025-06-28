<template>
  <div class="plu-selection-container">
    <div v-if="errorMessage" class="status-message alert alert-info">
      {{ errorMessage }}
    </div>

    <form class="plu-selection-form" :class="formClass">
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
          <ZoneSelector />
        </div>
      </div>

      <!-- Action Button -->
      <div class="text-center margin-top-lg margin-bottom-sm">
        <button
          @click="handleViewSynthesis"
          :disabled="!canViewSynthesis || isLoading"
          class="to-plu-btn btn"
          type="button"
        >
          <BaseSpinner
            v-if="isLoading"
            size="small"
            color="white"
            class="button-spinner"
          />
          {{ isLoading ? 'Chargement...' : buttonText }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

import { usePluStore } from '@/stores/plu'
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui'
import { useAnalytics } from '@/composables/useAnalytics'

import BaseSpinner from '@/components/common/BaseSpinner.vue'
import CitySelector from '@/components/plu/CitySelector.vue'
import ZoningSelector from '@/components/plu/ZoningSelector.vue'
import ZoneSelector from '@/components/plu/ZoneSelector.vue'

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

// Computed
const isLoading = computed(() => pluStore.isLoading)
const errorMessage = computed(() => pluStore.error)
const canViewSynthesis = computed(() => pluStore.canViewSynthesis)
const isAuthenticated = computed(() => authStore.isAuthenticated)

const formClass = computed(() => {
  return props.variant === 'home' ? 'form-home' : 'form-search'
})

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

/* Home page variant styling (default) */
.form-home {
  background: var(--color-white);
  border-radius: 3px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 3rem;
}

/* Search page variant styling */
.form-search {
  background: var(--color-white);
  border-radius: var(--radius-card);
  padding: var(--space-8);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--color-gray-200);
}

/* Responsive Design */
@media (max-width: 768px) {
  .form-home,
  .form-search {
    padding: var(--space-6);
  }

  .grid {
    gap: 1.5rem;
  }
}
</style>
