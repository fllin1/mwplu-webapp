<template>
  <div class="synthesis-tab">
    <div v-if="isLoading" class="loading-state">
      <BaseSpinner size="large" />
      <p class="loading-text">Chargement de la synthèse...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <div class="error-message">
        <h3>Erreur de chargement</h3>
        <p>{{ error }}</p>
      </div>
    </div>

    <div v-else-if="document" class="synthesis-content">
      <!-- Introduction Section -->
      <section v-if="document.introduction" class="content-section">
        <h2 class="section-title">Introduction</h2>
        <div class="content-body" v-html="document.introduction"></div>
      </section>

      <!-- Main Content Section -->
      <section v-if="document.content_html" class="content-section">
        <h2 class="section-title">Contenu de la synthèse</h2>
        <div class="content-body" v-html="document.content_html"></div>
      </section>

      <!-- Additional Sections (if any) -->
      <section v-if="document.additional_info" class="content-section">
        <h2 class="section-title">Informations complémentaires</h2>
        <div class="content-body" v-html="document.additional_info"></div>
      </section>

      <!-- Empty state if no content -->
      <div v-if="!hasContent" class="empty-state">
        <h3>Aucun contenu disponible</h3>
        <p>La synthèse pour cette zone n'est pas encore disponible.</p>
      </div>
    </div>

    <div v-else class="empty-state">
      <h3>Document non trouvé</h3>
      <p>Aucune synthèse n'a été trouvée pour cette sélection.</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import BaseSpinner from '@/components/common/BaseSpinner.vue'

// Props
const props = defineProps({
  document: {
    type: Object,
    default: null
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: null
  }
})

// Computed
const hasContent = computed(() => {
  if (!props.document) return false
  return !!(
    props.document.introduction ||
    props.document.content_html ||
    props.document.additional_info
  )
})
</script>

<style scoped>
.synthesis-tab {
  max-width: 100%;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-12) var(--space-4);
  text-align: center;
}

.loading-text {
  margin-top: var(--space-4);
  font-size: var(--font-size-lg);
  color: var(--color-gray-600);
}

.error-state {
  padding: var(--space-8) var(--space-4);
  text-align: center;
}

.error-message {
  background: var(--color-red-50);
  border: 1px solid var(--color-red-200);
  border-radius: var(--radius-card);
  padding: var(--space-6);
  max-width: 600px;
  margin: 0 auto;
}

.error-message h3 {
  color: var(--color-red-700);
  margin-bottom: var(--space-2);
}

.error-message p {
  color: var(--color-red-600);
  margin: 0;
}

.synthesis-content {
  max-width: 100%;
  overflow-x: auto;
}

.content-section {
  margin-bottom: var(--space-8);
  padding-bottom: var(--space-6);
  border-bottom: 1px solid var(--color-gray-200);
}

.content-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.section-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-black);
  margin-bottom: var(--space-4);
  line-height: var(--line-height-tight);
}

.content-body {
  line-height: var(--line-height-relaxed);
  color: var(--color-gray-800);
}

/* Style the HTML content */
.content-body :deep(h1),
.content-body :deep(h2),
.content-body :deep(h3),
.content-body :deep(h4),
.content-body :deep(h5),
.content-body :deep(h6) {
  margin-top: var(--space-6);
  margin-bottom: var(--space-3);
  color: var(--color-black);
  font-weight: var(--font-weight-semibold);
}

.content-body :deep(p) {
  margin-bottom: var(--space-4);
}

.content-body :deep(ul),
.content-body :deep(ol) {
  margin-bottom: var(--space-4);
  padding-left: var(--space-6);
}

.content-body :deep(li) {
  margin-bottom: var(--space-2);
}

.content-body :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: var(--space-4);
  border: 1px solid var(--color-gray-200);
}

.content-body :deep(th),
.content-body :deep(td) {
  padding: var(--space-3);
  text-align: left;
  border-bottom: 1px solid var(--color-gray-200);
}

.content-body :deep(th) {
  background: var(--color-gray-50);
  font-weight: var(--font-weight-semibold);
}

.content-body :deep(blockquote) {
  border-left: 4px solid var(--color-gray-300);
  padding-left: var(--space-4);
  margin: var(--space-4) 0;
  font-style: italic;
  color: var(--color-gray-600);
}

.empty-state {
  text-align: center;
  padding: var(--space-12) var(--space-4);
  background: var(--color-gray-50);
  border-radius: var(--radius-card);
  border: 1px solid var(--color-gray-200);
}

.empty-state h3 {
  color: var(--color-gray-700);
  margin-bottom: var(--space-2);
}

.empty-state p {
  color: var(--color-gray-600);
  margin: 0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .section-title {
    font-size: var(--font-size-xl);
  }

  .content-body :deep(table) {
    font-size: var(--font-size-sm);
  }

  .content-body :deep(th),
  .content-body :deep(td) {
    padding: var(--space-2);
  }
}
</style>
