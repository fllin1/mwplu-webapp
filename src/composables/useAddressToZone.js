// src/composables/useAddressToZone.js
import { ref } from 'vue'
import { usePluStore } from '@/stores/plu'
import { dbService } from '@/services/supabase'

/**
 * Simple text normalization: lowercase and trim only (as requested).
 */
function normalize(text) {
  return (text || '').toString().trim().toLowerCase()
}

/**
 * Build encoded GeoJSON point string from lon/lat.
 */
function buildEncodedPoint(lon, lat) {
  const geojson = { type: 'Point', coordinates: [lon, lat] }
  return encodeURIComponent(JSON.stringify(geojson))
}

export function useAddressToZone() {
  const isLoading = ref(false)
  const error = ref('')
  // Simple in-session cache to avoid repeated calls for identical inputs
  const cache = new Map()

  /**
   * Geocode an address using BAN API, optionally filtered by city name.
   * @param {string} address
   * @param {string} cityName - optional city label to bias results
   * @returns {Promise<{lon:number,lat:number,cityLabel:string}|null>}
   */
  const geocodeAddress = async (address, cityName) => {
    try {
      error.value = ''
      const params = new URLSearchParams()
      params.set('q', address)
      params.set('limit', '1')
      if (cityName) params.set('city', cityName)

      const url = `https://api-adresse.data.gouv.fr/search/?${params.toString()}`
      const res = await fetch(url)
      if (!res.ok) throw new Error('Geocoding API error')
      const data = await res.json()
      const feature = data?.features?.[0]
      if (!feature?.geometry?.coordinates) return null
      const [lon, lat] = feature.geometry.coordinates
      const cityLabel = feature?.properties?.city || ''
      return { lon, lat, cityLabel }
    } catch (e) {
      console.error('BAN geocoding failed:', e)
      error.value = "Échec de la géolocalisation de l'adresse"
      return null
    }
  }

  /**
   * Fetch urban zone from IGN GPU zone-urba API for a given point.
   * @param {number} lon
   * @param {number} lat
   * @returns {Promise<{libelle:string, geometry:object}|null>}
   */
  const fetchUrbanZone = async (lon, lat) => {
    try {
      error.value = ''
      const geom = buildEncodedPoint(lon, lat)
      const url = `https://apicarto.ign.fr/api/gpu/zone-urba?geom=${geom}`
      const res = await fetch(url)
      if (!res.ok) throw new Error('IGN zone-urba API error')
      const data = await res.json()
      const feature = data?.features?.[0]
      if (!feature) return null
      const libelle = feature?.properties?.libelle || ''
      const geometry = feature?.geometry || null
      return { libelle, geometry }
    } catch (e) {
      console.error('IGN zone lookup failed:', e)
      error.value = 'Échec de la recherche de la zone urbaine'
      return null
    }
  }

  /**
   * Resolve internal zoning/zone by exact lowercase name match within a city.
   * Loads city zonings and zones if needed, then returns matching IDs.
   * @param {string} cityId
   * @param {string} externalZoneName - libelle from IGN
   * @returns {Promise<{zoningId:string, zoneId:string, zoneName:string}|null>}
   */
  const resolveInternalZoneIds = async (cityId, externalZoneName) => {
    const pluStore = usePluStore()
    const target = normalize(externalZoneName)
    if (!cityId || !target) return null

    // Ensure cities loaded and selected city zonings loaded
    if (pluStore.cities.length === 0) {
      await pluStore.loadCities()
    }
    if (pluStore.selectedCityId !== cityId) {
      await pluStore.selectCity(cityId)
    }

    // Make sure zonings are loaded for the selected city
    const zonings = pluStore.zonings.slice()
    if (zonings.length === 0) return null

    // For each zoning, load zones and try to match by name (lowercase)
    for (const z of zonings) {
      // Ensure zones for this zoning are loaded
      const zonesRes = await dbService.getZones(z.id)
      if (!zonesRes.success || !Array.isArray(zonesRes.data)) continue
      const zones = zonesRes.data
      // 1) Exact match
      const found = zones.find((zone) => normalize(zone.name) === target)
      if (found) {
        return { zoningId: z.id, zoneId: found.id, zoneName: found.name, usedSmartMatch: false }
      }

      // 2) Smart fallback: if target ends with a lowercase letter, try without the last letter
      // Example: 'uc1a' -> try 'uc1'
      const m = target.match(/^(.+)([a-z])$/)
      if (m) {
        const base = m[1]
        const suffix = m[2]
        const foundBase = zones.find((zone) => normalize(zone.name) === base)
        if (foundBase) {
          return {
            zoningId: z.id,
            zoneId: foundBase.id,
            zoneName: foundBase.name,
            usedSmartMatch: true,
            smartMatch: { base, ignoredSuffix: suffix },
          }
        }
      }
    }
    return null
  }

  /**
   * Full flow: address → {lon,lat} → IGN zone libelle → internal zoning/zone IDs
   */
  const findZoneForAddress = async (address, cityName, cityId) => {
    try {
      isLoading.value = true
      error.value = ''
      const cacheKey = `${address}__${cityName}__${cityId}`.toLowerCase().trim()
      if (cache.has(cacheKey)) {
        return cache.get(cacheKey)
      }

      const geo = await geocodeAddress(address, cityName)
      if (!geo) {
        const res = { success: false, reason: 'GEOCODING_FAILED' }
        await dbService.logResearchHistory({
          city_id: cityId,
          address_input: address,
          success: false,
          reason: 'GEOCODING_FAILED',
        })
        return res
      }

      const zone = await fetchUrbanZone(geo.lon, geo.lat)
      if (!zone) {
        const res = { success: false, reason: 'ZONE_LOOKUP_FAILED', ...geo }
        await dbService.logResearchHistory({
          city_id: cityId,
          address_input: address,
          geo_lon: geo.lon,
          geo_lat: geo.lat,
          success: false,
          reason: 'ZONE_LOOKUP_FAILED',
        })
        return res
      }

      const match = await resolveInternalZoneIds(cityId, zone.libelle)
      if (!match) {
        const res = { success: false, reason: 'ZONE_NOT_FOUND', ...geo, zone }
        await dbService.logResearchHistory({
          city_id: cityId,
          address_input: address,
          geo_lon: geo.lon,
          geo_lat: geo.lat,
          zone_label: zone.libelle,
          success: false,
          reason: 'ZONE_NOT_FOUND',
        })
        return res
      }

      const successRes = {
        success: true,
        geo,
        zone,
        match,
      }
      cache.set(cacheKey, successRes)
      await dbService.logResearchHistory({
        city_id: cityId,
        address_input: address,
        geo_lon: geo.lon,
        geo_lat: geo.lat,
        zone_label: zone.libelle,
        success: true,
      })
      return successRes
    } finally {
      isLoading.value = false
    }
  }

  return {
    isLoading,
    error,
    geocodeAddress,
    fetchUrbanZone,
    resolveInternalZoneIds,
    findZoneForAddress,
  }
}
