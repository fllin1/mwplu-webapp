<template>
  <div class="city-selector">
    <label for="city-select" class="form-label">Ville</label>
    <div class="select-wrapper">
      <select
        id="city-select"
        :value="selectedCityId"
        class="form-select"
        :disabled="isLoading || isDisabled"
        @change="handleCityChange"
      >
        <option value="">Sélectionnez une ville</option>
        <option
          v-for="city in filteredCities"
          :key="city.id"
          :value="city.id"
        >
          {{ city.name }}
        </option>
      </select>
      <div v-if="isLoading" class="select-spinner">
        <BaseSpinner size="small" />
      </div>
    </div>

    <!-- Search functionality for large lists -->
    <div v-if="showSearch" class="search-wrapper">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Rechercher une ville..."
        class="search-input"
        @input="filterCities"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
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
const emit = defineEmits(['citySelected'])

// Store
const pluStore = usePluStore()

// Local state
const searchQuery = ref('')
const filteredCities = ref([])

// Computed
const isLoading = computed(() => pluStore.isLoading)
const cities = computed(() => pluStore.cities)
const selectedCityId = computed(() => pluStore.selectedCityId)
const isDisabled = computed(() => props.disabled || isLoading.value)

// Show search if more than 10 cities
const showSearch = computed(() => cities.value.length > 10)

// Methods
const filterCities = () => {
  if (!searchQuery.value.trim()) {
    filteredCities.value = cities.value
    return
  }

  const query = searchQuery.value.toLowerCase().trim()
  filteredCities.value = cities.value.filter(city =>
    city.name.toLowerCase().includes(query)
  )
}

const handleCityChange = async (event) => {
  const cityId = event.target.value
  await pluStore.selectCity(cityId)

  // Emit event for parent components
  const selectedCity = cities.value.find(city => city.id === cityId)
  emit('citySelected', { city: selectedCity, cityId })
}

// Watch for cities changes to update filtered list
watch(cities, (newCities) => {
  filteredCities.value = newCities
}, { immediate: true })

// Reset search when cities change
watch(cities, () => {
  searchQuery.value = ''
})
</script>

<style scoped>
.city-selector {
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

.search-wrapper {
  margin-top: 0.5rem;
}

.search-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--accent-gray);
  border-radius: 2px;
  background-color: var(--color-white);
  color: var(--color-black);
  font-size: 0.9rem;
  transition: border-color 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--color-black);
}

.search-input::placeholder {
  color: var(--text-secondary);
}

/* Responsive */
@media (max-width: 768px) {
  .form-select {
    font-size: 0.9rem;
    padding: 0.625rem;
  }

  .search-input {
    font-size: 0.85rem;
  }
}
</style>
