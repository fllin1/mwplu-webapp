<template>
  <div :style="{ height }" ref="mapEl" class="map-container" />
</template>

<script>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
// Ensure Leaflet marker icons work in production by explicitly importing assets
import markerIcon2xUrl from 'leaflet/dist/images/marker-icon-2x.png'
import markerIconUrl from 'leaflet/dist/images/marker-icon.png'
import markerShadowUrl from 'leaflet/dist/images/marker-shadow.png'
// Lazy-load Leaflet and its CSS on demand
let L = null

export default {
  name: 'MapPreview',
  props: {
    center: {
      type: Object, // { lat, lon }
      default: null,
    },
    marker: {
      type: Boolean,
      default: true,
    },
    polygonGeoJSON: {
      type: Object,
      default: null,
    },
    height: {
      type: String,
      default: '320px',
    },
    zoom: {
      type: Number,
      default: 14,
    },
  },
  setup(props) {
    const mapEl = ref(null)
    let map = null
    let markerLayer = null
    let polygonLayer = null

    const initMap = () => {
      if (!mapEl.value) return
      if (!L) return
      map = L.map(mapEl.value)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map)

      if (props.center) {
        const latlng = L.latLng(props.center.lat, props.center.lon)
        map.setView(latlng, props.zoom)
        if (props.marker) {
          markerLayer = L.marker(latlng).addTo(map)
        }
      } else {
        map.setView([46.8, 2.4], 6) // France default
      }

      if (props.polygonGeoJSON) {
        polygonLayer = L.geoJSON(props.polygonGeoJSON, {
          style: { color: '#2563eb', weight: 2, fillOpacity: 0.1 },
        }).addTo(map)
        try {
          map.fitBounds(polygonLayer.getBounds(), { padding: [16, 16] })
        } catch {
          // ignore fitBounds errors
        }
      }
    }

    const updateMarker = () => {
      if (!map || !props.center) return
      if (!L) return
      const latlng = L.latLng(props.center.lat, props.center.lon)
      if (!markerLayer && props.marker) {
        markerLayer = L.marker(latlng).addTo(map)
      } else if (markerLayer) {
        markerLayer.setLatLng(latlng)
      }
      map.setView(latlng, props.zoom)
    }

    const updatePolygon = () => {
      if (!map) return
      if (polygonLayer) {
        map.removeLayer(polygonLayer)
        polygonLayer = null
      }
      if (props.polygonGeoJSON) {
        if (!L) return
        polygonLayer = L.geoJSON(props.polygonGeoJSON, {
          style: { color: '#2563eb', weight: 2, fillOpacity: 0.1 },
        }).addTo(map)
        try {
          map.fitBounds(polygonLayer.getBounds(), { padding: [16, 16] })
        } catch {
          // ignore fitBounds errors
        }
      }
    }

    onMounted(async () => {
      if (!L) {
        const mod = await import('leaflet')
        L = mod.default || mod
        await import('leaflet/dist/leaflet.css')

        // Configure default marker icons with bundled asset URLs
        if (L?.Icon?.Default) {
          L.Icon.Default.mergeOptions({
            iconRetinaUrl: markerIcon2xUrl,
            iconUrl: markerIconUrl,
            shadowUrl: markerShadowUrl,
          })
        }
      }
      initMap()
    })
    onBeforeUnmount(() => {
      if (map) {
        map.remove()
        map = null
      }
    })

    watch(
      () => props.center,
      () => updateMarker(),
    )
    watch(
      () => props.polygonGeoJSON,
      () => updatePolygon(),
    )

    return { mapEl }
  },
}
</script>

<style scoped>
.map-container {
  width: 100%;
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-card);
  overflow: hidden;
}
</style>
