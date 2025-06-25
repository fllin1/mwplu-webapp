<template>
  <div class="zone-selector">
    <label for="zone-select" class="form-label">Zone</label>
    <div class="select-wrapper">
      <select
        id="zone-select"
        :value="selectedZoneId"
        class="form-select"
        :disabled="isDisabled"
        @change="handleZoneChange"
      >
        <option value="">{{ placeholderText }}</option>
        <option
          v-for="zone in zones"
          :key="zone.id"
          :value="zone.id"
        >
          {{ zone.name }}
        </option>
      </select>
      <div v-if="isLoading" class="select-spinner">
        <BaseSpinner size="small" />
      </div>
    </div>

    <!-- Show zone description if available -->
    <div v-if="selectedZone?.description" class="zone-description">
      <p>{{ selectedZone.description }}</p>
    </div>

    <!-- Selection summary when complete -->
    <div v-if="isSelectionComplete && showSummary" class="selection-summary">
      <div class="summary-item">
        <span class="summary-label">Ville :</span>
        <span class="summary-value">{{ selectedCity?.name }}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">Zonage :</span>
        <span class="summary-value">{{ selectedZoning?.name }}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">Zone :</span>
        <span class="summary-value">{{ selectedZone?.name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { usePluStore } from '@/stores/plu'
import BaseSpinner from '@/components/common/BaseSpinner.vue'

// Props
const props = defineProps({
  disabled: {
    type: Boolean,
    default: false
  },
  showSummary: {
    type: Boolean,
    default: true
  }
})

// Emits
const emit = defineEmits(['zoneSelected', 'selectionComplete'])

// Store
const pluStore = usePluStore()

// Computed
const isLoading = computed(() => pluStore.isLoading)
const zones = computed(() => pluStore.zones)
const selectedZoneId = computed(() => pluStore.selectedZoneId)
const selectedZone = computed(() => pluStore.selectedZone)
const selectedZoningId = computed(() => pluStore.selectedZoningId)
const selectedZoning = computed(() => pluStore.selectedZoning)
const selectedCity = computed(() => pluStore.selectedCity)
const isSelectionComplete = computed(() => pluStore.isSelectionComplete)

const isDisabled = computed(() =>
  props.disabled || isLoading.value || !selectedZoningId.value
)

const placeholderText = computed(() => {
  if (!selectedZoningId.value) {
    return "Sélectionnez d'abord un zonage"
  }
  if (isLoading.value) {
    return "Chargement des zones..."
  }
  if (zones.value.length === 0 && selectedZoningId.value) {
    return "Aucune zone disponible"
  }
  return "Sélectionnez une zone"
})

// Methods
const handleZoneChange = (event) => {
  const zoneId = event.target.value
  pluStore.selectZone(zoneId)

  // Emit event for parent components
  const selectedZone = zones.value.find(zone => zone.id === zoneId)
  emit('zoneSelected', { zone: selectedZone, zoneId })

  // Emit selection complete if all fields are filled
  if (zoneId && isSelectionComplete.value) {
    emit('selectionComplete', {
      city: selectedCity.value,
      zoning: selectedZoning.value,
      zone: selectedZone,
      params: pluStore.getSelectionParams()
    })
  }
}
</script>

<style scoped>
.zone-selector {
  width: 100%;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--color-black);
}

.select-wrapper {
  position: relative;
}

.form-select {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid var(--accent-gray);
  border-radius: 2px;
  background-color: var(--color-white);
  color: var(--color-black);
  transition: all 0.2s ease;
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
}

.form-select:focus {
  outline: none;
  border-color: var(--color-black);
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
}

.form-select:disabled {
  background-color: var(--accent-gray);
  color: var(--text-secondary);
  cursor: not-allowed;
  opacity: 0.6;
}

.select-spinner {
  position: absolute;
  right: 2.5rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}

.zone-description {
  margin-top: 0.5rem;
  padding: 0.75rem;
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: 2px;
  border-left: 3px solid var(--color-black);
}

.zone-description p {
  margin: 0;
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.4;
}

.selection-summary {
  margin-top: 1rem;
  padding: 1rem;
  background-color: rgba(0, 0, 0, 0.03);
  border-radius: 4px;
  border: 1px solid var(--accent-gray);
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.summary-item:last-child {
  margin-bottom: 0;
}

.summary-label {
  font-weight: 500;
  color: var(--color-black);
  font-size: 0.9rem;
}

.summary-value {
  color: var(--text-secondary);
  font-size: 0.9rem;
  text-align: right;
  flex: 1;
  margin-left: 1rem;
}

/* Responsive */
@media (max-width: 768px) {
  .form-select {
    font-size: 0.9rem;
    padding: 0.625rem;
  }

  .zone-description {
    padding: 0.5rem;
  }

  .zone-description p {
    font-size: 0.8rem;
  }

  .selection-summary {
    padding: 0.75rem;
  }

  .summary-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }

  .summary-value {
    text-align: left;
    margin-left: 0;
  }
}
</style>
