<template>
  <div class="comments-tab">
    <!-- Rating Section -->
    <section class="rating-section">
      <h3 class="section-title">Évaluation du document</h3>

      <div class="rating-container">
        <div class="current-rating" v-if="documentRating">
          <span class="rating-label">Note moyenne:</span>
          <div class="rating-display">
            <div class="stars">
              <span v-for="star in 5" :key="star" :class="['star', { 'filled': star <= Math.round(documentRating) }]">
                ★
              </span>
            </div>
            <span class="rating-value">{{ formatRating(documentRating) }} / 5</span>
            <span class="rating-count" v-if="ratingCount">({{ ratingCount }} évaluations)</span>
          </div>
        </div>

        <div class="user-rating" v-if="isAuthenticated">
          <span class="rating-label">Votre évaluation:</span>
          <div class="rating-input">
            <button v-for="star in 5" :key="star" @click="submitUserRating(star)" @mouseover="hoverRating = star"
              @mouseleave="hoverRating = 0" :class="['star-button', {
                'filled': star <= (hoverRating || userRating),
                'hover': hoverRating > 0 && star <= hoverRating
              }]" :disabled="isSubmittingRating" type="button">
              ★
            </button>
            <span v-if="userRating" class="user-rating-text">
              Vous avez noté: {{ userRating }} / 5
            </span>
          </div>
        </div>

        <div v-else class="login-prompt">
          <p>
            <router-link to="/login" class="login-link">
              Connectez-vous
            </router-link>
            pour évaluer ce document.
          </p>
        </div>
      </div>
    </section>

    <!-- Comments Section -->
    <section class="comments-section">
      <div class="comments-header">
        <h3 class="section-title">Commentaires</h3>
        <span class="comment-count" v-if="comments?.length">
          {{ comments.length }} commentaire{{ comments.length > 1 ? 's' : '' }}
        </span>
      </div>

      <!-- Comment Form -->
      <div v-if="isAuthenticated" class="comment-form-container">
        <form @submit.prevent="submitComment" class="comment-form">
          <div class="form-group">
            <label for="comment-text" class="form-label">
              Ajouter un commentaire
            </label>
            <textarea id="comment-text" v-model="newComment" class="comment-textarea"
              placeholder="Partagez votre avis sur cette synthèse..." rows="4" maxlength="1000" required></textarea>
            <div class="character-count">
              {{ newComment.length }} / 1000 caractères
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" :disabled="!newComment.trim() || isSubmittingComment" class="submit-btn btn">
              <BaseSpinner v-if="isSubmittingComment" size="small" color="white" class="button-spinner" />
              {{ isSubmittingComment ? 'Publication...' : 'Publier le commentaire' }}
            </button>
          </div>
        </form>
      </div>

      <div v-else class="login-prompt">
        <p>
          <router-link to="/login" class="login-link">
            Connectez-vous
          </router-link>
          pour laisser un commentaire.
        </p>
      </div>

      <!-- Comments List -->
      <div class="comments-list">
        <div v-if="isLoadingComments" class="loading-state">
          <BaseSpinner size="medium" />
          <p>Chargement des commentaires...</p>
        </div>

        <div v-else-if="comments?.length" class="comments">
          <div v-for="comment in comments" :key="comment.id" class="comment-item">
            <div class="comment-header">
              <div class="comment-author">
                <strong>{{ comment.user_email || 'Utilisateur anonyme' }}</strong>
              </div>
              <div class="comment-date">
                {{ formatDate(comment.created_at) }}
              </div>
            </div>
            <div class="comment-content">
              {{ comment.content }}
            </div>
          </div>
        </div>

        <div v-else class="empty-comments">
          <p>Aucun commentaire pour le moment. Soyez le premier à commenter !</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui'
import BaseSpinner from '@/components/common/BaseSpinner.vue'

// Props
const props = defineProps({
  documentId: {
    type: String,
    required: true
  },
  documentRating: {
    type: Number,
    default: null
  },
  ratingCount: {
    type: Number,
    default: 0
  }
})

// Emits
const emit = defineEmits(['rating-updated', 'comment-added'])

// Composables
const authStore = useAuthStore()
const uiStore = useUIStore()

// Reactive data
const comments = ref([])
const newComment = ref('')
const userRating = ref(0)
const hoverRating = ref(0)
const isLoadingComments = ref(false)
const isSubmittingComment = ref(false)
const isSubmittingRating = ref(false)

// Computed
const isAuthenticated = computed(() => authStore.isAuthenticated)

// Methods
const formatRating = (rating) => {
  if (!rating) return '0.0'
  return Number(rating).toFixed(1)
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const submitUserRating = async (rating) => {
  if (!isAuthenticated.value || isSubmittingRating.value) return

  try {
    isSubmittingRating.value = true

    // Here you would call your rating service
    // await ratingService.submitRating(props.documentId, rating)

    userRating.value = rating
    emit('rating-updated', rating)

    uiStore.showSuccess('Votre évaluation a été enregistrée.')
  } catch (error) {
    console.error('Error submitting rating:', error)
    uiStore.showError('Erreur lors de l\'enregistrement de votre évaluation.')
  } finally {
    isSubmittingRating.value = false
  }
}

const submitComment = async () => {
  if (!newComment.value.trim() || isSubmittingComment.value) return

  try {
    isSubmittingComment.value = true

    // Here you would call your comment service
    // const comment = await commentService.submitComment(props.documentId, newComment.value)

    // Mock comment for now
    const comment = {
      id: Date.now(),
      content: newComment.value,
      user_email: authStore.user?.email,
      created_at: new Date().toISOString()
    }

    comments.value.unshift(comment)
    newComment.value = ''
    emit('comment-added', comment)

    uiStore.showSuccess('Votre commentaire a été publié.')
  } catch (error) {
    console.error('Error submitting comment:', error)
    uiStore.showError('Erreur lors de la publication de votre commentaire.')
  } finally {
    isSubmittingComment.value = false
  }
}

const loadComments = async () => {
  if (!props.documentId) return

  try {
    isLoadingComments.value = true

    // Here you would call your comment service
    // comments.value = await commentService.getComments(props.documentId)

    // Mock comments for now
    comments.value = []
  } catch (error) {
    console.error('Error loading comments:', error)
    uiStore.showError('Erreur lors du chargement des commentaires.')
  } finally {
    isLoadingComments.value = false
  }
}

const loadUserRating = async () => {
  if (!isAuthenticated.value || !props.documentId) return

  try {
    // Here you would call your rating service
    // userRating.value = await ratingService.getUserRating(props.documentId)

    // Mock for now
    userRating.value = 0
  } catch (error) {
    console.error('Error loading user rating:', error)
  }
}

// Watchers
watch(() => props.documentId, () => {
  if (props.documentId) {
    loadComments()
    loadUserRating()
  }
}, { immediate: true })

watch(() => authStore.isAuthenticated, (isAuth) => {
  if (isAuth) {
    loadUserRating()
  } else {
    userRating.value = 0
  }
})

// Initialize
onMounted(() => {
  if (props.documentId) {
    loadComments()
    loadUserRating()
  }
})
</script>

<style scoped>
.comments-tab {
  max-width: 100%;
}

.rating-section,
.comments-section {
  margin-bottom: var(--space-8);
  padding-bottom: var(--space-6);
  border-bottom: 1px solid var(--color-gray-200);
}

.comments-section {
  border-bottom: none;
  margin-bottom: 0;
}

.section-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-black);
  margin-bottom: var(--space-4);
}

.rating-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.current-rating,
.user-rating {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.rating-label {
  font-weight: var(--font-weight-medium);
  color: var(--color-gray-700);
  min-width: 120px;
}

.rating-display {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.stars {
  display: flex;
  gap: 2px;
}

.star {
  color: var(--color-gray-300);
  font-size: 1.25rem;
}

.star.filled {
  color: #fbbf24;
}

.rating-value {
  font-weight: var(--font-weight-semibold);
  color: var(--color-black);
}

.rating-count {
  color: var(--color-gray-600);
  font-size: var(--font-size-sm);
}

.rating-input {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.star-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--color-gray-300);
  cursor: pointer;
  transition: color var(--transition-fast);
  padding: 2px;
}

.star-button:hover,
.star-button.hover {
  color: #fbbf24;
}

.star-button.filled {
  color: #fbbf24;
}

.star-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.user-rating-text {
  font-size: var(--font-size-sm);
  color: var(--color-gray-600);
  margin-left: var(--space-2);
}

.login-prompt {
  padding: var(--space-4);
  background: var(--color-gray-50);
  border-radius: var(--radius-card);
  border: 1px solid var(--color-gray-200);
  text-align: center;
}

.login-link {
  color: var(--color-black);
  text-decoration: underline;
  font-weight: var(--font-weight-medium);
}

.login-link:hover {
  color: var(--color-gray-700);
}

.comments-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-6);
}

.comment-count {
  color: var(--color-gray-600);
  font-size: var(--font-size-sm);
}

.comment-form-container {
  margin-bottom: var(--space-8);
}

.comment-form {
  background: var(--color-white);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-card);
  padding: var(--space-6);
}

.form-group {
  margin-bottom: var(--space-4);
}

.form-label {
  display: block;
  font-weight: var(--font-weight-medium);
  color: var(--color-black);
  margin-bottom: var(--space-2);
}

.comment-textarea {
  width: 100%;
  padding: var(--space-3);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--radius-form);
  font-family: inherit;
  font-size: var(--font-size-base);
  line-height: var(--line-height-relaxed);
  resize: vertical;
  min-height: 100px;
}

.comment-textarea:focus {
  outline: 2px solid var(--color-blue);
  outline-offset: -2px;
  border-color: var(--color-blue);
}

.character-count {
  font-size: var(--font-size-sm);
  color: var(--color-gray-600);
  text-align: right;
  margin-top: var(--space-1);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
}

.submit-btn {
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
}

.submit-btn:hover:not(:disabled) {
  background: var(--color-gray-800);
  border-color: var(--color-gray-800);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-8);
  text-align: center;
}

.loading-state p {
  margin-top: var(--space-2);
  color: var(--color-gray-600);
}

.comments {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.comment-item {
  background: var(--color-white);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-card);
  padding: var(--space-4);
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-2);
}

.comment-author {
  color: var(--color-black);
}

.comment-date {
  color: var(--color-gray-600);
  font-size: var(--font-size-sm);
}

.comment-content {
  color: var(--color-gray-800);
  line-height: var(--line-height-relaxed);
}

.empty-comments {
  text-align: center;
  padding: var(--space-8);
  color: var(--color-gray-600);
  background: var(--color-gray-50);
  border-radius: var(--radius-card);
  border: 1px solid var(--color-gray-200);
}

/* Responsive Design */
@media (max-width: 768px) {

  .current-rating,
  .user-rating {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-2);
  }

  .rating-label {
    min-width: auto;
  }

  .comments-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-2);
  }

  .comment-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-1);
  }
}
</style>
