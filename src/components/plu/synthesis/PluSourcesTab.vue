<template>
  <div class="sources-tab">
    <!-- Sources Section -->
    <section class="sources-section">
      <h3 class="section-title">Sources du document</h3>

      <div v-if="computedSources.length" class="sources-list">
        <div v-for="(source, index) in computedSources" :key="index" class="source-item">
          <div class="source-header">
            <h4 class="source-title">{{ source.title || `Source ${index + 1}` }}</h4>
            <span v-if="source.type" class="source-type">{{ source.type }}</span>
          </div>

          <div v-if="source.description" class="source-description">
            {{ source.description }}
          </div>

          <div class="source-meta">
            <span v-if="source.date" class="source-date">
              Date: {{ formatDate(source.date) }}
            </span>
            <span v-if="source.author" class="source-author">
              Auteur: {{ source.author }}
            </span>
          </div>

          <div v-if="source.url" class="source-link">
            <a :href="source.url" target="_blank" rel="noopener noreferrer" class="external-link">
              Consulter la source
              <span class="external-icon">↗</span>
            </a>
          </div>
        </div>
      </div>

      <div v-else class="empty-sources">
        <p>Aucune source n'est disponible.</p>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  document: {
    type: Object,
    default: null
  },
  documentId: {
    type: String,
    required: true
  }
})

// Composables
// Build sources list: PLU original (from document), plus static references
const computedSources = computed(() => {
  const sources = []

  const pluUrl = props.document?.source_plu_url || props.document?.source_url
  if (pluUrl) {
    sources.push({
      title: 'Document PLU original',
      type: 'Document officiel',
      url: pluUrl,
      description: "Lien vers le document PLU d'origine."
    })
  }

  sources.push({
    title: "Vocabulaire national d'urbanisme",
    type: 'Référence',
    url: 'https://outil2amenagement.cerema.fr/ressources/guides-fiches/lexique-national-durbanisme',
    description: 'Lexique de référence fourni par le Cerema.'
  })

  sources.push({
    title: "Conditions générales d'utilisation",
    type: 'Politiques',
    url: 'https://mwplu.com/policies/terms',
    description: "Conditions d'utilisation du service MWPLU."
  })

  return sources
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
</script>

<style scoped>
.sources-tab {
  max-width: 100%;
}

.sources-section,
.downloads-section {
  margin-bottom: var(--space-4);
  padding-bottom: var(--space-6);
}

.downloads-section {
  border-bottom: none;
  margin-bottom: 0;
}

.section-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-black);
  margin-bottom: var(--space-6);
}

/* Sources Styles */
.sources-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.source-item {
  background: var(--color-white);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-card);
  padding: var(--space-6);
}

.source-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-3);
}

.source-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-black);
  margin: 0;
}

.source-type {
  background: var(--color-gray-100);
  color: var(--color-gray-700);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-button);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.source-description {
  color: var(--color-gray-800);
  line-height: var(--line-height-relaxed);
  margin-bottom: var(--space-3);
}

.source-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
  margin-bottom: var(--space-3);
  font-size: var(--font-size-sm);
  color: var(--color-gray-600);
}

.source-date,
.source-author {
  font-weight: var(--font-weight-medium);
}

.source-link {
  margin-top: var(--space-3);
}

.external-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  color: var(--color-black);
  text-decoration: underline;
  font-weight: var(--font-weight-medium);
  transition: color var(--transition-fast);
}

.external-link:hover {
  color: var(--color-gray-700);
}

.external-icon {
  font-size: var(--font-size-sm);
}

.empty-sources {
  text-align: center;
  padding: var(--space-8);
  background: var(--color-gray-50);
  border-radius: var(--radius-card);
  border: 1px solid var(--color-gray-200);
  color: var(--color-gray-600);
}

/* Responsive Design */
@media (max-width: 768px) {
  .source-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-2);
  }

  .source-meta {
    flex-direction: column;
    gap: var(--space-1);
  }
}
</style>
