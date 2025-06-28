<template>
  <AppLayout>
    <div class="main-content">
      <!-- Loading State -->
      <div v-if="isLoading" class="loading-container">
        <BaseSpinner size="large" color="blue" />
        <p class="loading-text">Chargement du document PLU...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="errorMessage" class="error-page-container">
        <div class="error-card card">
          <h2 class="error-title">Erreur de chargement</h2>
          <p class="error-message-text">{{ errorMessage }}</p>
          <div class="error-actions">
            <button @click="loadPluData" class="btn btn-primary">
              Réessayer
            </button>
            <router-link to="/" class="btn btn-secondary">
              Retour à l'accueil
            </router-link>
          </div>
        </div>
      </div>

      <!-- PLU Content -->
      <div v-else-if="pluData" class="plu-details-view">
        <BreadcrumbNav :items="breadcrumbItems" class="plu-breadcrumb-nav" />

        <!-- Header Section -->
        <section class="plu-header-section card">
          <div class="plu-header-content">
            <h1 class="plu-main-title">PLU {{ pluData.city_name }}</h1>
            <div class="plu-meta-info">
              <span class="plu-zone-name">{{ pluData.zoning_name }} - {{ pluData.zone_name }}</span>
              <span class="plu-update-date">
                Mis à jour le {{ formatDate(pluData.updated_at) }}
              </span>
            </div>
          </div>

          <div class="plu-stats-grid">
            <div class="stat-item">
              <span class="stat-number">{{ pluData.rating_average || 'N/A' }}</span>
              <span class="stat-label">Note moyenne</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">{{ pluData.comments_count || 0 }}</span>
              <span class="stat-label">Commentaires</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">{{ pluData.downloads_count || 0 }}</span>
              <span class="stat-label">Téléchargements</span>
            </div>
          </div>
        </section>

        <!-- Tab Navigation -->
        <nav class="plu-tab-navigation">
          <div class="tabs-container">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              :class="['tab-button', { 'tab-button--active': activeTab === tab.id }]"
            >
              {{ tab.label }}
            </button>
          </div>
        </nav>

        <!-- Tab Content Area -->
        <main class="plu-tab-content-area card">
          <!-- Synthesis Tab -->
          <section v-if="activeTab === 'synthesis'" class="tab-panel-content">
            <div class="content-section">
              <h2 class="section-heading">Synthèse du PLU</h2>
              <div class="synthesis-text-content" v-html="pluData.synthesis_content || 'Contenu de synthèse non disponible.'">
              </div>
            </div>


          </section>

          <!-- Comments Tab -->
          <section v-if="activeTab === 'comments'" class="tab-panel-content">
            <div class="comments-section">
              <!-- Rating Section (Independent) -->
              <div v-if="authStore.isAuthenticated" class="rating-section card">
                <h3 class="section-subheading">Noter ce document</h3>
                <p class="rating-description">Attribuez une note à ce document PLU selon sa qualité et son utilité.</p>
                <div class="rating-form">
                  <div class="current-rating" v-if="userRating">
                    <span class="rating-label">Votre note actuelle :</span>
                    <div class="rating-display">
                      <span v-for="star in 5" :key="star" :class="['star-display', { 'star-display--filled': star <= userRating }]">
                        ★
                      </span>
                      <span class="rating-value">({{ userRating }}/5)</span>
                    </div>
                  </div>

                  <div class="rating-input">
                    <span class="rating-label">{{ userRating ? 'Modifier votre note :' : 'Attribuer une note :' }}</span>
                    <div class="rating-stars">
                      <button
                        v-for="star in 5"
                        :key="star"
                        type="button"
                        @click="submitRating(star)"
                        :class="['star-button', { 'star-button--active': star <= (hoveredRating || userRating || 0) }]"
                        @mouseenter="hoveredRating = star"
                        @mouseleave="hoveredRating = 0"
                        :disabled="isSubmittingRating"
                      >
                        ★
                      </button>
                    </div>
                    <div v-if="isSubmittingRating" class="rating-loading">
                      <BaseSpinner size="small" />
                      <span>Enregistrement...</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Comment Form Section (Independent) -->
              <div v-if="authStore.isAuthenticated" class="add-comment-section card">
                <h3 class="section-subheading">Ajouter un commentaire</h3>
                <form @submit.prevent="submitComment" class="comment-form">
                  <div class="form-group">
                    <label for="comment-text" class="form-label">Votre commentaire</label>
                    <textarea
                      id="comment-text"
                      v-model="newComment.text"
                      class="form-textarea"
                      rows="4"
                      placeholder="Partagez votre avis sur ce document PLU..."
                      required
                    ></textarea>
                  </div>

                  <div class="form-actions">
                    <button type="submit" :disabled="isSubmittingComment" class="btn btn-primary">
                      <BaseSpinner v-if="isSubmittingComment" size="small" color="white" />
                      {{ isSubmittingComment ? 'Publication...' : 'Publier le commentaire' }}
                    </button>
                  </div>
                </form>
              </div>

              <div v-else class="auth-prompt-card card">
                <p class="auth-prompt-text">Vous devez être connecté pour noter et commenter ce document.</p>
                <router-link to="/login" class="btn btn-primary">Se connecter</router-link>
              </div>

              <!-- Comments List -->
              <div class="comments-list-section card">
                <h3 class="section-subheading">Commentaires ({{ comments.length }})</h3>

                <div v-if="comments.length === 0" class="empty-state-message">
                  <p>Aucun commentaire pour le moment. Soyez le premier à partager votre avis !</p>
                </div>

                <div v-for="comment in comments" :key="comment.id" class="comment-item card">
                  <div class="comment-header">
                    <span class="comment-author">{{ comment.user_email }}</span>
                    <span class="comment-date">{{ formatDate(comment.created_at) }}</span>
                  </div>
                  <div class="comment-content-text">
                    <p>{{ comment.text }}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Sources Tab -->
          <section v-if="activeTab === 'sources'" class="tab-panel-content">
            <div class="sources-section">
              <h2 class="section-heading">Documents sources</h2>
              <p class="section-description">
                Retrouvez ici les documents officiels utilisés pour cette synthèse.
              </p>

              <div class="sources-list">
                <div v-for="source in pluData.sources" :key="source.id" class="source-item card">
                  <div class="source-info">
                    <h4 class="source-title">{{ source.title }}</h4>
                    <p class="source-description">{{ source.description }}</p>
                    <div class="source-meta">
                      <span class="source-type">{{ source.type }}</span>
                      <span class="source-date">{{ formatDate(source.date) }}</span>
                      <span class="source-size">{{ formatFileSize(source.file_size) }}</span>
                    </div>
                  </div>
                  <div class="source-actions">
                    <a :href="source.file_url" target="_blank" class="btn btn-secondary btn-small">
                      Voir le document
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Downloads Tab -->
          <section v-if="activeTab === 'downloads'" class="tab-panel-content">
            <div class="downloads-section">
              <div class="download-item card">
                <div class="download-info">
                  <h4 class="download-title">Document de Synthèse</h4>
                </div>
                <button @click="downloadFile('synthesis', 'pdf')" class="btn btn-primary">
                  Télécharger PDF
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  </AppLayout>
</template>

<script>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui'
import { dbService } from '@/services/supabase'
import AppLayout from '@/components/layout/AppLayout.vue'
import BreadcrumbNav from '@/components/layout/BreadcrumbNav.vue'
import BaseSpinner from '@/components/common/BaseSpinner.vue'
import { capitalizeWords } from '@/utils/helpers'

export default {
  name: 'PluSynthesisView',

  components: {
    AppLayout,
    BreadcrumbNav,
    BaseSpinner,
  },

  setup() {
    const route = useRoute()
    const authStore = useAuthStore()
    const uiStore = useUIStore()

    const isLoading = ref(true)
    const errorMessage = ref('')
    const pluData = ref(null)
    const comments = ref([])
    const activeTab = ref('synthesis') // Default active tab
    const isSubmittingComment = ref(false)

    // Rating functionality (independent)
    const userRating = ref(null)
    const hoveredRating = ref(0)
    const isSubmittingRating = ref(false)

    const newComment = reactive({
      text: '',
    })

    const tabs = [
      { id: 'synthesis', label: 'Synthèse' },
      { id: 'comments', label: 'Commentaires' },
      { id: 'sources', label: 'Sources' },
      { id: 'downloads', label: 'Téléchargements' },
    ]

    // Computed properties for breadcrumbs
    const breadcrumbItems = computed(() => {
      const items = []
      if (pluData.value) {
        items.push(
          { label: capitalizeWords(pluData.value.city_name), to: { name: 'home', query: { city: pluData.value.city_id } } },
          { label: pluData.value.zoning_name, to: { name: 'home', query: { city: pluData.value.city_id, zoning: pluData.value.zoning_id } } },
          { label: 'Zone ' + pluData.value.zone_name, to: { name: 'plu-synthesis', query: { city: pluData.value.city_id, zoning: pluData.value.zoning_id, zone: pluData.value.zone_id } } },
        )
      }
      return items
    })

    /**
     * Fetches PLU data from Supabase based on route parameters.
     */
    const loadPluData = async () => {
      isLoading.value = true
      errorMessage.value = ''
      pluData.value = null
      comments.value = []

      const cityId = route.query.city
      const zoningId = route.query.zoning
      const zoneId = route.query.zone

      if (!cityId || !zoningId || !zoneId) {
        errorMessage.value = 'Paramètres de PLU manquants.'
        isLoading.value = false
        return
      }

      try {
        const result = await dbService.getDocument(zoningId, zoneId)

        if (result.success) {
          pluData.value = result.data
          // If there's an existing session, try to load comments and user rating
          if (authStore.isAuthenticated) {
            await loadComments()
            await loadUserRating()
          }
        } else {
          errorMessage.value = `Erreur: ${result.error || 'Document non trouvé'}`
        }
      } catch (error) {
        console.error('Error loading PLU data:', error)
        errorMessage.value = 'Une erreur inattendue est survenue lors du chargement du PLU.'
      } finally {
        isLoading.value = false
      }
    }

    /**
     * Fetches comments for the current PLU.
     */
    const loadComments = async () => {
      if (!pluData.value) return
      try {
        const result = await dbService.getCommentsForPlu(pluData.value.id)
        if (result.success) {
          comments.value = result.data
        } else {
          console.error('Error loading comments:', result.error)
          uiStore.showNotification('Erreur lors du chargement des commentaires.', 'error')
        }
      } catch (error) {
        console.error('Error loading comments:', error)
        uiStore.showNotification('Une erreur inattendue est survenue lors du chargement des commentaires.', 'error')
      }
    }

    /**
     * Loads the user's current rating for the document.
     */
    const loadUserRating = async () => {
      if (!pluData.value || !authStore.isAuthenticated) return
      try {
        const result = await dbService.getUserRating(pluData.value.id, authStore.user.id)
        if (result.success && result.data) {
          userRating.value = result.data.rating
        }
      } catch (error) {
        console.error('Error loading user rating:', error)
      }
    }

    /**
     * Submits or updates a rating for the document.
     */
    const submitRating = async (rating) => {
      if (isSubmittingRating.value || !authStore.isAuthenticated) return

      isSubmittingRating.value = true
      try {
        const result = await dbService.submitRating(pluData.value.id, authStore.user.id, rating)
        if (result.success) {
          userRating.value = rating
          uiStore.showNotification('Note enregistrée avec succès !', 'success')
          // Update document stats if available
          if (pluData.value) {
            await loadPluData() // Reload to get updated average rating
          }
        } else {
          throw new Error(result.error || 'Erreur lors de l\'enregistrement de la note')
        }
      } catch (error) {
        console.error('Error submitting rating:', error)
        uiStore.showNotification(`Erreur lors de l'enregistrement de la note : ${error.message || 'Une erreur inattendue est survenue.'}`, 'error')
      } finally {
        isSubmittingRating.value = false
      }
    }

    /**
     * Submits a new comment.
     */
    const submitComment = async () => {
      if (isSubmittingComment.value || !newComment.text.trim()) return

      isSubmittingComment.value = true
      try {
        const result = await dbService.addComment(pluData.value.id, newComment.text.trim())
        if (result.success) {
          uiStore.showNotification('Commentaire publié avec succès !', 'success')
          newComment.text = ''
          await loadComments() // Reload comments after successful submission
        } else {
          throw new Error(result.error || 'Erreur lors de la publication du commentaire')
        }
      } catch (error) {
        console.error('Error submitting comment:', error)
        uiStore.showNotification(`Erreur lors de la publication du commentaire : ${error.message || 'Une erreur inattendue est survenue.'}`, 'error')
      } finally {
        isSubmittingComment.value = false
      }
    }

    /**
     * Handles file download.
     * @param {string} type - 'synthesis' or 'source'
     * @param {string} id - For synthesis, it's the format (pdf/docx). For source, it's the source ID.
     */
    const downloadFile = async (type, id) => {
      try {
        let fileUrl = '';
        // let fileName = '';

        if (type === 'synthesis') {
          // In a real app, this would generate a signed URL from Supabase Storage
          // For now, simulate based on format
          if (id === 'pdf') {
            fileUrl = '/path/to/plu-synthesis.pdf'; // Placeholder
          } else if (id === 'docx') {
            fileUrl = '/path/to/plu-synthesis.docx'; // Placeholder
          }
        } else if (type === 'source') {
          const source = pluData.value.sources.find(s => s.id === id);
          if (source) {
            fileUrl = source.file_url;
          } else {
            throw new Error('Source document not found.');
          }
        }

        if (!fileUrl) {
          throw new Error('URL de téléchargement non disponible.');
        }

        // Simulate download by opening in a new tab
        window.open(fileUrl, '_blank');

        // Optionally, track the download
        // await dbService.recordDownload(pluData.value.id, authStore.user?.id || null, type);
        uiStore.showNotification('Téléchargement lancé !', 'success');

      } catch (error) {
        console.error('Download error:', error);
        uiStore.showNotification(`Erreur lors du téléchargement : ${error.message || 'Une erreur inattendue est survenue.'}`, 'error');
      }
    };

    /**
     * Formats a date string for display.
     */
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A'
      const options = { year: 'numeric', month: 'long', day: 'numeric' }
      return new Date(dateString).toLocaleDateString('fr-FR', options)
    }

    /**
     * Formats file size in bytes to a human-readable format.
     */
    const formatFileSize = (bytes, decimalPoint) => {
      if (bytes == 0) return '0 Bytes'
      const k = 1000
      const dm = decimalPoint || 2
      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
    }

    // Load data on component mount and when route changes
    onMounted(() => {
      loadPluData()
    })

    watch(
      () => route.query,
      (newQuery, oldQuery) => {
        // Only reload if relevant query params change
        if (newQuery.city !== oldQuery.city || newQuery.zoning !== oldQuery.zoning || newQuery.zone !== oldQuery.zone) {
          loadPluData()
        }
      },
      { deep: true }
    )

    // Watch auth state to reload comments and rating if user logs in/out
    watch(
      () => authStore.isAuthenticated,
      (newVal) => {
        if (newVal && pluData.value) {
          loadComments()
          loadUserRating()
        } else if (!newVal) {
          comments.value = [] // Clear comments if user logs out
          userRating.value = null // Clear user rating if user logs out
        }
      }
    )

    return {
      isLoading,
      errorMessage,
      pluData,
      comments,
      activeTab,
      isSubmittingComment,
      newComment,
      tabs,
      breadcrumbItems,
      authStore,
      // Rating functionality
      userRating,
      hoveredRating,
      isSubmittingRating,
      // Methods
      loadPluData,
      loadUserRating,
      submitRating,
      submitComment,
      downloadFile,
      formatDate,
      formatFileSize,
    }
  },
}
</script>

<style scoped>
.main-content {
  max-width: 1200px;
  margin: var(--space-8) auto;
  padding: 0 var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-12);
}

/* Loading and Error States */
.loading-container,
.error-page-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - var(--header-height) - var(--footer-height) - var(--space-16));
  gap: var(--space-4);
  text-align: center;
}

.loading-text {
  font-size: var(--font-size-md);
  color: var(--color-gray-700);
}

.error-card {
  padding: var(--space-8);
  border-radius: var(--radius-card);
  background-color: var(--color-white);
  box-shadow: var(--shadow-md);
  max-width: 500px;
  width: 90%;
}

.error-title {
  font-size: var(--font-size-2xl);
  color: var(--color-red-600);
  margin-bottom: var(--space-4);
}

.error-message-text {
  font-size: var(--font-size-md);
  color: var(--color-gray-700);
  margin-bottom: var(--space-8);
  line-height: 1.5;
}

.error-actions {
  display: flex;
  justify-content: center;
  gap: var(--space-4);
  flex-wrap: wrap;
}

/* PLU Details View Structure */
.plu-details-view {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.plu-breadcrumb-nav {
  margin-bottom: var(--space-4);
}

/* Header Section */
.plu-header-section {
  padding: var(--space-8);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-6) var(--space-8);
}

.plu-header-content {
  flex-grow: 1;
}

.plu-main-title {
  font-size: var(--font-size-3xl);
  color: var(--color-color-black);
  margin-bottom: var(--space-2);
  line-height: 1.2;
}

.plu-meta-info {
  font-size: var(--font-size-sm);
  color: var(--color-gray-600);
}

.plu-zone-name,
.plu-update-date {
  margin-right: var(--space-4);
}

.plu-stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-4);
  background-color: var(--color-gray-50);
  padding: var(--space-4);
  border-radius: var(--radius-button);
}

.stat-item {
  text-align: center;
  border-right: 1px solid var(--color-gray-200);
  padding-right: var(--space-4);
}

.stat-item:last-child {
  border-right: none;
  padding-right: 0;
}

.stat-number {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-color-black);
  display: block;
  margin-bottom: var(--space-1);
}

.stat-label {
  font-size: var(--font-size-xs);
  color: var(--color-gray-600);
  display: block;
}

/* Tab Navigation */
.plu-tab-navigation {
  background-color: var(--color-white);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-sm);
  padding: var(--space-4);
}

.tabs-container {
  display: flex;
  justify-content: space-around;
  gap: var(--space-2);
  max-width: 800px;
  margin: 0 auto;
}

.tab-button {
  flex: 1;
  padding: var(--space-3) var(--space-4);
  border: none;
  background-color: transparent;
  color: var(--color-gray-700);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  border-radius: var(--radius-button);
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  position: relative;
}

/* Add vertical separator after each button except the last one */
.tab-button:not(:last-child)::after {
  content: '';
  position: absolute;
  right: calc(var(--space-2) / -2);
  top: 10%;
  bottom: 10%;
  width: 1px;
  background-color: var(--color-gray-200);
}

/* Hide separator when button or next button is active */
.tab-button--active::after,
.tab-button:hover:not(.tab-button--active) {
  background-color: var(--color-gray-100);
  color: var(--color-color-black);
}

.tab-button--active {
  background-color: var(--color-black);
  color: var(--color-white);
  box-shadow: var(--shadow-sm);
}

.tab-button-icon {
  font-size: var(--font-size-lg);
}

/* Tab Content Area */
.plu-tab-content-area {
  padding: var(--space-8);
}

.tab-panel-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-10);
}

.content-section {
  padding: var(--space-6);
  background-color: var(--color-gray-50);
  border-radius: var(--radius-card);
  border: 1px solid var(--color-gray-200);
}

.section-heading {
  font-size: var(--font-size-xl);
  color: var(--color-color-black);
  margin-bottom: var(--space-4);
  padding-bottom: var(--space-2);
  border-bottom: 1px solid var(--color-gray-200);
}

.section-subheading {
  font-size: var(--font-size-lg);
  color: var(--color-color-black);
  margin-bottom: var(--space-4);
}

.section-description {
  font-size: var(--font-size-md);
  color: var(--color-gray-700);
  line-height: 1.6;
  margin-bottom: var(--space-6);
}

/* Synthesis Tab Specifics */
.synthesis-text-content {
  font-size: var(--font-size-md);
  line-height: 1.7;
  color: var(--color-gray-800);
}

.synthesis-text-content :deep(p) {
  margin-bottom: var(--space-4);
}

.synthesis-text-content :deep(h1),
.synthesis-text-content :deep(h2),
.synthesis-text-content :deep(h3) {
  color: var(--color-color-black);
  margin-top: var(--space-8);
  margin-bottom: var(--space-4);
}

.synthesis-text-content :deep(h1) {
  font-size: var(--font-size-2xl);
}
.synthesis-text-content :deep(h2) {
  font-size: var(--font-size-xl);
}
.synthesis-text-content :deep(h3) {
  font-size: var(--font-size-lg);
}

.rules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-6);
}

.rule-card {
  padding: var(--space-6);
  background-color: var(--color-white);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-gray-200);
}

.rule-title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--color-color-black);
  margin-bottom: var(--space-2);
}

.rule-description {
  font-size: var(--font-size-sm);
  color: var(--color-gray-700);
  line-height: 1.6;
}

.constraints-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.constraint-item {
  padding: var(--space-4);
  background-color: var(--color-white);
  border-radius: var(--radius-button);
  box-shadow: var(--shadow-xs);
  border: 1px solid var(--color-gray-200);
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.constraint-type {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-blue);
  background-color: var(--color-blue-50);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-pill);
  white-space: nowrap;
}

.constraint-description {
  font-size: var(--font-size-sm);
  color: var(--color-gray-700);
  line-height: 1.5;
}

/* Comments Tab Specifics */
.comments-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.add-comment-section,
.auth-prompt-card,
.comments-list-section {
  padding: var(--space-8);
  border-radius: var(--radius-card);
  background-color: var(--color-white);
  box-shadow: var(--shadow-md);
}

.comment-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.form-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-gray-700);
}

.form-textarea {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--radius-button);
  background-color: var(--color-white);
  font-size: var(--font-size-md);
  color: var(--color-color-black);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
  resize: vertical;
  min-height: 100px;
}

.form-textarea:focus {
  outline: none;
  border-color: var(--color-blue);
  box-shadow: var(--shadow-focus);
}

.rating-input {
  display: flex;
  gap: var(--space-1);
}

.star-button {
  background: none;
  border: none;
  font-size: var(--font-size-xl);
  color: var(--color-gray-300);
  cursor: pointer;
  transition: color var(--transition-fast);
  padding: 0 var(--space-1);
}

.star-button--active {
  color: var(--color-yellow-500);
}

.auth-prompt-card {
  text-align: center;
}

.auth-prompt-text {
  font-size: var(--font-size-md);
  color: var(--color-gray-700);
  margin-bottom: var(--space-6);
}

.empty-state-message {
  padding: var(--space-6);
  background-color: var(--color-gray-50);
  border-radius: var(--radius-card);
  text-align: center;
  color: var(--color-gray-600);
  font-style: italic;
  font-size: var(--font-size-md);
}

.comment-item {
  padding: var(--space-6);
  background-color: var(--color-gray-50);
  border-radius: var(--radius-card);
  border: 1px solid var(--color-gray-200);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.comment-header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  font-size: var(--font-size-sm);
  color: var(--color-gray-600);
  flex-wrap: wrap;
}

.comment-author {
  font-weight: var(--font-weight-semibold);
  color: var(--color-color-black);
}

.comment-date {
  font-size: var(--font-size-xs);
  color: var(--color-gray-500);
}

.comment-rating {
  margin-left: auto; /* Push rating to the right */
  display: flex;
  gap: 1px; /* Tighter star spacing */
}

.star-display {
  color: var(--color-gray-300);
  font-size: var(--font-size-md);
}

.star-display--filled {
  color: var(--color-yellow-500);
}

.comment-content-text {
  font-size: var(--font-size-md);
  color: var(--color-gray-800);
  line-height: 1.6;
}

/* Sources Tab Specifics */
.sources-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.sources-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.source-item {
  padding: var(--space-6);
  background-color: var(--color-white);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-gray-200);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-4);
}

.source-info {
  flex-grow: 1;
}

.source-title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--color-color-black);
  margin-bottom: var(--space-1);
}

.source-description {
  font-size: var(--font-size-sm);
  color: var(--color-gray-700);
  line-height: 1.5;
  margin-bottom: var(--space-2);
}

.source-meta {
  display: flex;
  gap: var(--space-3);
  font-size: var(--font-size-xs);
  color: var(--color-gray-500);
}

.source-type,
.source-date,
.source-size {
  background-color: var(--color-gray-100);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-pill);
  font-weight: var(--font-weight-medium);
  color: var(--color-gray-700);
}

.source-actions .btn {
  white-space: nowrap;
}

/* Downloads Tab Specifics */
.downloads-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  align-items: center;
}

.download-options {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.download-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-6);
}

.download-item {
  padding: var(--space-6);
  background-color: var(--color-white);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-gray-200);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  width: 100%;
  max-width: 350px;
}

.download-info {
  flex-grow: 1;
}

.download-title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--color-color-black);
  margin-bottom: var(--space-1);
}

.download-description {
  font-size: var(--font-size-sm);
  color: var(--color-gray-700);
  line-height: 1.5;
}

/* Rating Section Styles */
.rating-section {
  padding: var(--space-6);
  margin-bottom: var(--space-6);
}

.rating-description {
  font-size: var(--font-size-sm);
  color: var(--color-gray-600);
  margin-bottom: var(--space-4);
}

.rating-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.current-rating {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  background-color: var(--color-gray-50);
  border-radius: var(--radius-form);
}

.rating-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-black);
  margin-bottom: var(--space-2);
  display: block;
}

.rating-display {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.rating-value {
  font-size: var(--font-size-sm);
  color: var(--color-gray-600);
  margin-left: var(--space-2);
}

.rating-input {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.rating-stars {
  display: flex;
  gap: var(--space-1);
}

.star-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--color-gray-300);
  cursor: pointer;
  transition: color var(--transition-fast);
  padding: var(--space-1);
}

.star-button:hover,
.star-button--active {
  color: #FFD700; /* Gold color for stars */
}

.star-button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.star-display {
  font-size: 1rem;
  color: var(--color-gray-300);
}

.star-display--filled {
  color: #FFD700;
}

.rating-loading {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--font-size-sm);
  color: var(--color-gray-600);
}

/* General Buttons (used in different sections) */
.btn {
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-button);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  text-decoration: none;
  transition: all var(--transition-fast);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  cursor: pointer;
}

.btn-primary {
  background-color: var(--color-black);
  color: var(--color-white);
  width: 100%;
}

.btn-primary:hover {
  background-color: var(--color-gray-700);
}

.btn-secondary {
  background-color: transparent;
  color: var(--color-color-black);
  border: 1px solid var(--color-gray-300);
}

.btn-secondary:hover {
  background-color: var(--color-gray-100);
  border-color: var(--color-gray-400);
}

.btn-danger {
  background-color: var(--color-red-600);
  color: var(--color-white);
  border: 1px solid var(--color-red-600);
}

.btn-danger:hover {
  background-color: var(--color-red-700);
  border-color: var(--color-red-700);
}

.btn-small {
  padding: var(--space-2) var(--space-4);
  font-size: var(--font-size-sm);
}

/* Responsive Adjustments */
@media (max-width: 768px) {
  .plu-header-section {
    flex-direction: column;
    align-items: flex-start;
    padding: var(--space-6);
    text-align: center;
  }

  .plu-main-title {
    font-size: var(--font-size-2xl);
    text-align: center;
    width: 100%;
  }

  .plu-meta-info {
    text-align: center;
    width: 100%;
    margin-bottom: var(--space-4);
  }

  .plu-stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    width: 100%;
  }

  .stat-item {
    border-right: none;
    padding-right: 0;
    padding: var(--space-2) 0;
  }

  .plu-tab-navigation {
    padding: var(--space-2);
  }

  .tabs-container {
    flex-wrap: wrap;
    justify-content: center;
  }

  .tab-button {
    flex-basis: 48%; /* Two buttons per row */
    font-size: var(--font-size-sm);
    padding: var(--space-2) var(--space-3);
  }

  .plu-tab-content-area {
    padding: var(--space-6);
  }

  .content-section {
    padding: var(--space-4);
  }

  .section-heading {
    font-size: var(--font-size-xl);
  }

  .section-subheading {
    font-size: var(--font-size-md);
  }

  .rules-grid {
    grid-template-columns: 1fr;
  }

  .constraint-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-2);
    padding: var(--space-3);
  }

  .constraint-type {
    width: 100%;
    text-align: center;
  }

  .add-comment-section,
  .auth-prompt-card,
  .comments-list-section {
    padding: var(--space-6);
  }

  .comment-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-1);
  }

  .comment-rating {
    margin-left: 0;
    margin-top: var(--space-1);
  }

  .source-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .source-meta {
    flex-wrap: wrap;
  }

  .download-grid {
    grid-template-columns: 1fr;
  }

  .download-item {
    align-items: flex-start;
  }
}
</style>
