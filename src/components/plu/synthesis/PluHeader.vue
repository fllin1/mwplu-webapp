<template>
  <div class="plu-header">
    <div class="document-info">
      <div class="breadcrumb-section">
        <BreadcrumbNav />
      </div>

      <div class="document-title">
        <h1 class="title">{{ documentTitle }}</h1>
        <div class="metadata">
          <span class="city-name">{{ cityName }}</span>
          <span class="separator">•</span>
          <span class="zone-info">{{ zoneInfo }}</span>
        </div>
      </div>
    </div>

    <div class="document-stats" v-if="document">
      <div class="stat-item">
        <span class="stat-label">Dernière mise à jour</span>
        <span class="stat-value">{{ formatDate(document.updated_at) }}</span>
      </div>
      <div class="stat-item" v-if="document.rating_average">
        <span class="stat-label">Note moyenne</span>
        <span class="stat-value">{{ formatRating(document.rating_average) }} / 5</span>
      </div>
      <div class="stat-item" v-if="document.comment_count">
        <span class="stat-label">Commentaires</span>
        <span class="stat-value">{{ document.comment_count }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import BreadcrumbNav from '@/components/layout/BreadcrumbNav.vue'

// Props
const props = defineProps({
  document: {
    type: Object,
    default: null
  },
  cityName: {
    type: String,
    default: ''
  },
  zoningName: {
    type: String,
    default: ''
  },
  zoneName: {
    type: String,
    default: ''
  }
})

// Computed
const documentTitle = computed(() => {
  if (!props.document) return 'Chargement...'
  return `Synthèse PLU - ${props.zoneName}`
})

const zoneInfo = computed(() => {
  if (!props.zoningName || !props.zoneName) return ''
  return `${props.zoningName} - ${props.zoneName}`
})

// Methods
const formatDate = (dateString) => {
  if (!dateString) return 'Non disponible'
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatRating = (rating) => {
  if (!rating) return '0.0'
  return Number(rating).toFixed(1)
}
</script>

<style scoped>
.plu-header {
  background: var(--color-white);
  border-bottom: 1px solid var(--color-gray-200);
  padding: var(--space-6) 0;
  margin-bottom: var(--space-8);
}

.document-info {
  margin-bottom: var(--space-6);
}

.breadcrumb-section {
  margin-bottom: var(--space-4);
}

.document-title {
  text-align: left;
}

.title {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-black);
  margin-bottom: var(--space-2);
  line-height: var(--line-height-tight);
}

.metadata {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--font-size-lg);
  color: var(--color-gray-600);
}

.city-name {
  font-weight: var(--font-weight-semibold);
  color: var(--color-black);
}

.separator {
  color: var(--color-gray-400);
}

.zone-info {
  font-weight: var(--font-weight-medium);
}

.document-stats {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-6);
  padding: var(--space-4);
  background: var(--color-gray-50);
  border-radius: var(--radius-card);
  border: 1px solid var(--color-gray-200);
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--color-gray-600);
  font-weight: var(--font-weight-medium);
}

.stat-value {
  font-size: var(--font-size-base);
  color: var(--color-black);
  font-weight: var(--font-weight-semibold);
}

/* Responsive Design */
@media (max-width: 768px) {
  .plu-header {
    padding: var(--space-4) 0;
    margin-bottom: var(--space-6);
  }

  .title {
    font-size: var(--font-size-2xl);
  }

  .metadata {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-1);
  }

  .separator {
    display: none;
  }

  .document-stats {
    flex-direction: column;
    gap: var(--space-4);
  }

  .stat-item {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
