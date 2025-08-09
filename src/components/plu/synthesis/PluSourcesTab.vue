<template>
  <div class="sources-tab">
    <!-- Sources Section -->
    <section class="sources-section">
      <h3 class="section-title">Sources du document</h3>

      <div v-if="document?.sources?.length" class="sources-list">
        <div
          v-for="(source, index) in document.sources"
          :key="index"
          class="source-item"
        >
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
            <a
              :href="source.url"
              target="_blank"
              rel="noopener noreferrer"
              class="external-link"
            >
              Consulter la source
              <span class="external-icon">↗</span>
            </a>
          </div>
        </div>
      </div>

      <div v-else class="empty-sources">
        <p>Aucune source spécifique n'est disponible pour ce document.</p>
      </div>
    </section>

    <!-- Downloads Section -->
    <section class="downloads-section">
      <h3 class="section-title">Téléchargements</h3>

      <div class="download-info">
        <p class="download-description">
          Téléchargez cette synthèse PLU dans différents formats pour une consultation hors ligne.
        </p>
      </div>

      <div class="download-options">
        <!-- PDF Download -->
        <div class="download-item">
          <div class="download-content">
            <div class="download-icon">📄</div>
            <div class="download-details">
              <h4 class="download-title">Synthèse PDF</h4>
              <p class="download-desc">Version complète au format PDF</p>
              <div class="download-meta">
                <span class="file-size">Environ 2-5 MB</span>
                <span class="file-format">Format: PDF</span>
              </div>
            </div>
          </div>
          <button
            @click="downloadDocument('pdf')"
            :disabled="isDownloading"
            class="download-btn"
          >
            <BaseSpinner
              v-if="isDownloading && downloadingType === 'pdf'"
              size="small"
              color="white"
              class="button-spinner"
            />
            {{ isDownloading && downloadingType === 'pdf' ? 'Téléchargement...' : 'Télécharger PDF' }}
          </button>
        </div>

        <!-- Word Download -->
        <div class="download-item">
          <div class="download-content">
            <div class="download-icon">📝</div>
            <div class="download-details">
              <h4 class="download-title">Document Word</h4>
              <p class="download-desc">Version modifiable au format DOCX</p>
              <div class="download-meta">
                <span class="file-size">Environ 1-3 MB</span>
                <span class="file-format">Format: DOCX</span>
              </div>
            </div>
          </div>
          <button
            @click="downloadDocument('docx')"
            :disabled="isDownloading"
            class="download-btn"
          >
            <BaseSpinner
              v-if="isDownloading && downloadingType === 'docx'"
              size="small"
              color="white"
              class="button-spinner"
            />
            {{ isDownloading && downloadingType === 'docx' ? 'Téléchargement...' : 'Télécharger DOCX' }}
          </button>
        </div>

        <!-- Text Download -->
        <div class="download-item">
          <div class="download-content">
            <div class="download-icon">📋</div>
            <div class="download-details">
              <h4 class="download-title">Texte simple</h4>
              <p class="download-desc">Version texte brut sans mise en forme</p>
              <div class="download-meta">
                <span class="file-size">Environ 50-200 KB</span>
                <span class="file-format">Format: TXT</span>
              </div>
            </div>
          </div>
          <button
            @click="downloadDocument('txt')"
            :disabled="isDownloading"
            class="download-btn"
          >
            <BaseSpinner
              v-if="isDownloading && downloadingType === 'txt'"
              size="small"
              color="white"
              class="button-spinner"
            />
            {{ isDownloading && downloadingType === 'txt' ? 'Téléchargement...' : 'Télécharger TXT' }}
          </button>
        </div>
      </div>

      <!-- Download Stats -->
      <div v-if="document?.download_count" class="download-stats">
        <p class="stats-text">
          Ce document a été téléchargé {{ document.download_count }} fois.
        </p>
      </div>

      <!-- Authentication Required -->
      <div v-if="!isAuthenticated" class="auth-required">
        <div class="auth-message">
          <h4>Connexion requise</h4>
          <p>
            Vous devez être connecté pour télécharger les documents.
          </p>
          <router-link to="/login" class="login-btn">
            Se connecter
          </router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui'
import { useAnalytics } from '@/composables/useAnalytics'
import { dbService } from '@/services/supabase'
import BaseSpinner from '@/components/common/BaseSpinner.vue'

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
const authStore = useAuthStore()
const uiStore = useUIStore()
const { trackEvent } = useAnalytics()

// Reactive data
const isDownloading = ref(false)
const downloadingType = ref('')

// Computed
const isAuthenticated = computed(() => authStore.isAuthenticated)

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

const downloadDocument = async (format) => {
  if (!isAuthenticated.value) {
    uiStore.showInfo('Veuillez vous connecter pour télécharger ce document.')
    return
  }

  if (isDownloading.value) return

  try {
    isDownloading.value = true
    downloadingType.value = format

    // Track download in database
    const trackResult = await dbService.trackDownload(props.documentId, format)
    if (!trackResult.success) {
      console.error('Failed to track download:', trackResult.error)
    }

    // Track download event for analytics
    trackEvent('plu_download', {
      document_id: props.documentId,
      format: format,
      user_id: authStore.user?.id
    })

    // For now, this is a mock download since we don't have actual files
    // In a real implementation, you would:
    // 1. Get the download URL from your storage
    // 2. Create the download link
    // 3. Trigger the download
    
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Simulate download completion
    const filename = `plu-synthesis-${props.documentId}.${format}`
    
    // Note: When you have actual files, replace the above with:
    const { data: urlData, error: urlError } = await supabase.storage
      .from('documents')
      .createSignedUrl(filePath, 60, { download: true })
    
    if (urlData?.signedUrl) {
      const link = document.createElement('a')
      link.href = urlData.signedUrl
      link.download = filename
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
    
  } catch (error) {
    console.error('Error downloading document:', error)
    uiStore.showError('Erreur lors du téléchargement du document.')
  } finally {
    isDownloading.value = false
    downloadingType.value = ''
  }
}
</script>

<style scoped>
.sources-tab {
  max-width: 100%;
}

.sources-section,
.downloads-section {
  margin-bottom: var(--space-8);
  padding-bottom: var(--space-6);
  border-bottom: 1px solid var(--color-gray-200);
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

/* Downloads Styles */
.download-info {
  margin-bottom: var(--space-6);
}

.download-description {
  color: var(--color-gray-700);
  line-height: var(--line-height-relaxed);
  margin: 0;
}

.download-options {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.download-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--color-white);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-card);
  padding: var(--space-6);
  transition: border-color var(--transition-fast);
}

.download-item:hover {
  border-color: var(--color-gray-300);
}

.download-content {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  flex: 1;
}

.download-icon {
  font-size: 2rem;
  opacity: 0.8;
}

.download-details {
  flex: 1;
}

.download-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-black);
  margin: 0 0 var(--space-1) 0;
}

.download-desc {
  color: var(--color-gray-600);
  margin: 0 0 var(--space-2) 0;
  font-size: var(--font-size-sm);
}

.download-meta {
  display: flex;
  gap: var(--space-3);
  font-size: var(--font-size-xs);
  color: var(--color-gray-500);
}

.download-btn {
  background: var(--color-black);
  color: var(--color-white);
  border: 2px solid var(--color-black);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-button);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  white-space: nowrap;
}

.download-btn:hover:not(:disabled) {
  background: var(--color-gray-800);
  border-color: var(--color-gray-800);
}

.download-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.download-stats {
  text-align: center;
  padding: var(--space-4);
  background: var(--color-gray-50);
  border-radius: var(--radius-card);
  border: 1px solid var(--color-gray-200);
  margin-bottom: var(--space-6);
}

.stats-text {
  color: var(--color-gray-600);
  font-size: var(--font-size-sm);
  margin: 0;
}

.auth-required {
  background: var(--color-blue-50);
  border: 1px solid var(--color-blue-200);
  border-radius: var(--radius-card);
  padding: var(--space-6);
}

.auth-message {
  text-align: center;
}

.auth-message h4 {
  color: var(--color-blue-700);
  margin: 0 0 var(--space-2) 0;
}

.auth-message p {
  color: var(--color-blue-600);
  margin: 0 0 var(--space-4) 0;
}

.login-btn {
  display: inline-block;
  background: var(--color-black);
  color: var(--color-white);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-button);
  text-decoration: none;
  font-weight: var(--font-weight-medium);
  transition: background-color var(--transition-fast);
}

.login-btn:hover {
  background: var(--color-gray-800);
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

  .download-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-4);
  }

  .download-content {
    width: 100%;
  }

  .download-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
