/**
 * PLU Store
 * @module stores/plu
 * @description Manages PLU (Plan Local d'Urbanisme) selection state and related data
 * @version 1.0.0
 * @author GreyPanda
 *
 * @changelog
 * - 1.0.0 (2025-06-08): Initial version with PLU selection state management.
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { dbService } from '@/services/supabase'
import { useAnalytics } from '@/composables/useAnalytics'
import { capitalizeWords } from '@/utils/helpers'

export const usePluStore = defineStore('plu', () => {
  const { trackEvent } = useAnalytics()

  // State
  const isLoading = ref(false)
  const error = ref('')

  // Data
  const cities = ref([])
  const zonings = ref([])
  const zones = ref([])

  // Selection
  const selectedCityId = ref('')
  const selectedZoningId = ref('')
  const selectedZoneId = ref('')

  // Computed
  const selectedCity = computed(() => cities.value.find((city) => city.id === selectedCityId.value))

  const selectedZoning = computed(() =>
    zonings.value.find((zoning) => zoning.id === selectedZoningId.value),
  )

  const selectedZone = computed(() => zones.value.find((zone) => zone.id === selectedZoneId.value))

  const canViewSynthesis = computed(
    () => selectedCityId.value && selectedZoningId.value && selectedZoneId.value,
  )

  const isSelectionComplete = computed(() => canViewSynthesis.value)

  // Actions
  const setLoading = (loading) => {
    isLoading.value = loading
  }

  const setError = (errorMessage) => {
    error.value = errorMessage
  }

  const clearError = () => {
    error.value = ''
  }

  const loadCities = async () => {
    try {
      setLoading(true)
      clearError()

      const result = await dbService.getCities()

      if (result.success) {
        cities.value = result.data.map((city) => ({ ...city, name: capitalizeWords(city.name) }))
      } else {
        setError('Erreur lors du chargement des communes')
      }
    } catch (error) {
      console.error('Error loading cities:', error)
      setError("Une erreur inattendue s'est produite")
    } finally {
      setLoading(false)
    }
  }

  const selectCity = async (cityId) => {
    if (selectedCityId.value === cityId) return

    try {
      setLoading(true)
      clearError()

      // Reset dependent selections
      selectedCityId.value = cityId
      selectedZoningId.value = ''
      selectedZoneId.value = ''
      zonings.value = []
      zones.value = []

      if (!cityId) return

      // Track analytics event
      const city = cities.value.find((c) => c.id === cityId)
      if (city) {
        trackEvent('city_selected', {
          city_name: city.name,
          city_id: cityId,
        })
      }

      // Load zonings for selected city
      const result = await dbService.getZonings(cityId)

      if (result.success) {
        zonings.value = result.data
      } else {
        setError('Erreur lors du chargement des zonages')
      }
    } catch (error) {
      console.error('Error selecting city:', error)
      setError("Une erreur inattendue s'est produite")
    } finally {
      setLoading(false)
    }
  }

  const selectZoning = async (zoningId) => {
    if (selectedZoningId.value === zoningId) return

    try {
      setLoading(true)
      clearError()

      // Reset dependent selections
      selectedZoningId.value = zoningId
      selectedZoneId.value = ''
      zones.value = []

      if (!zoningId) return

      // Load zones for selected zoning
      const result = await dbService.getZones(zoningId)

      if (result.success) {
        zones.value = result.data
      } else {
        setError('Erreur lors du chargement des zones')
      }
    } catch (error) {
      console.error('Error selecting zoning:', error)
      setError("Une erreur inattendue s'est produite")
    } finally {
      setLoading(false)
    }
  }

  const selectZone = (zoneId) => {
    selectedZoneId.value = zoneId
    clearError()

    // Track analytics event when selection is complete
    if (zoneId && canViewSynthesis.value) {
      trackEvent('zone_selected', {
        city_name: selectedCity.value?.name,
        zoning_name: selectedZoning.value?.name,
        zone_name: selectedZone.value?.name,
        city_id: selectedCityId.value,
        zoning_id: selectedZoningId.value,
        zone_id: zoneId,
      })
    }
  }

  const resetSelection = () => {
    selectedCityId.value = ''
    selectedZoningId.value = ''
    selectedZoneId.value = ''
    zonings.value = []
    zones.value = []
    clearError()
  }

  const getSelectionParams = () => {
    if (!canViewSynthesis.value) return null

    return {
      city: selectedCityId.value,
      zoning: selectedZoningId.value,
      zone: selectedZoneId.value,
    }
  }

  // Initialize from query params or saved state
  const initializeSelection = async (queryParams = {}) => {
    try {
      // Load cities first
      await loadCities()

      // If we have query params, try to restore selection
      if (queryParams.city) {
        await selectCity(queryParams.city)

        if (queryParams.zoning) {
          await selectZoning(queryParams.zoning)

          if (queryParams.zone) {
            selectZone(queryParams.zone)
          }
        }
      }
    } catch (error) {
      console.error('Error initializing PLU selection:', error)
      setError("Erreur lors de l'initialisation")
    }
  }

  return {
    // State
    isLoading,
    error,

    // Data
    cities,
    zonings,
    zones,

    // Selection
    selectedCityId,
    selectedZoningId,
    selectedZoneId,

    // Computed
    selectedCity,
    selectedZoning,
    selectedZone,
    canViewSynthesis,
    isSelectionComplete,

    // Actions
    loadCities,
    selectCity,
    selectZoning,
    selectZone,
    resetSelection,
    getSelectionParams,
    initializeSelection,
    clearError,
  }
})
