<template>
  <div class="zoning-selector">
    <label for="zoning-select" class="form-label">Zonage</label>
    <div class="select-wrapper">
      <select
        id="zoning-select"
        :value="selectedZoningId"
        class="form-select"
        :disabled="isDisabled"
        @change="handleZoningChange"
      >
        <option value="">{{ placeholderText }}</option>
        <option
          v-for="zoning in zonings"
          :key="zoning.id"
          :value="zoning.id"
        >
          {{ zoning.name }}
        </option>
      </select>
      <div v-if="isLoading" class="select-spinner">
        <BaseSpinner size="small" />
      </div>
    </div>

    <!-- Show zoning description if available -->
    <div v-if="selectedZoning?.description" class="zoning-description">
      <p>{{ selectedZoning.description }}</p>
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
  }
})

// Emits
const emit = defineEmits(['zoningSelected'])

// Store
const pluStore = usePluStore()

// Computed
const isLoading = computed(() => pluStore.isLoading)
const zonings = computed(() => pluStore.zonings)
const selectedZoningId = computed(() => pluStore.selectedZoningId)
const selectedZoning = computed(() => pluStore.selectedZoning)
const selectedCityId = computed(() => pluStore.selectedCityId)

const isDisabled = computed(() =>
  props.disabled || isLoading.value || !selectedCityId.value
)

const placeholderText = computed(() => {
  if (!selectedCityId.value) {
    return "Sélectionnez d'abord une ville"
  }
  if (isLoading.value) {
    return "Chargement des zonages..."
  }
  if (zonings.value.length === 0 && selectedCityId.value) {
    return "Aucun zonage disponible"
  }
  return "Sélectionnez un zonage"
})

// Methods
const handleZoningChange = async (event) => {
  const zoningId = event.target.value
  await pluStore.selectZoning(zoningId)

  // Emit event for parent components
  const selectedZoning = zonings.value.find(zoning => zoning.id === zoningId)
  emit('zoningSelected', { zoning: selectedZoning, zoningId })
}
</script>

<style scoped>
.zoning-selector {
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

.zoning-description {
  margin-top: 0.5rem;
  padding: 0.75rem;
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: 2px;
  border-left: 3px solid var(--color-black);
}

.zoning-description p {
  margin: 0;
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.4;
}

/* Responsive */
@media (max-width: 768px) {
  .form-select {
    font-size: 0.9rem;
    padding: 0.625rem;
  }

  .zoning-description {
    padding: 0.5rem;
  }

  .zoning-description p {
    font-size: 0.8rem;
  }
}
</style>
