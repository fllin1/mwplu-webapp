<template>
  <div class="comments-tab">
    <!-- Rating Section -->
    <section class="rating-section card">
      <h3 class="section-title">Noter ce document</h3>

      <div v-if="!authStore.isAuthenticated" class="auth-prompt">
        <p>Connectez-vous pour noter ce document</p>
        <router-link to="/login" class="btn btn-primary">Se connecter</router-link>
      </div>

      <div v-else class="rating-container">
        <div class="document-rating-info">
          <div class="average-rating">
            <span class="rating-value">{{ documentRating || 'N/A' }}</span>
            <div class="rating-stars">
              <span v-for="star in 5" :key="star" class="star-display"
                :class="{ 'star-filled': star <= Math.round(documentRating || 0) }">★</span>
            </div>
            <span class="rating-count">({{ ratingCount || 0 }} avis)</span>
          </div>
        </div>

        <div class="user-rating">
          <p class="rating-label">Votre note :</p>
          <div class="rating-input">
            <button v-for="star in 5" :key="star" @click="handleRating(star)" class="star-button"
              :class="{ 'star-active': star <= (userRating || 0) }" :disabled="isSubmittingRating">
              ★
            </button>
          </div>
          <button v-if="userRating" @click="handleRemoveRating" class="btn btn-secondary btn-small"
            :disabled="isSubmittingRating">
            Supprimer ma note
          </button>
        </div>
      </div>
    </section>

    <!-- Comments Section -->
    <section class="comments-section card">
      <h3 class="section-title">Commentaires</h3>

      <!-- Add Comment Form -->
      <div v-if="!authStore.isAuthenticated" class="auth-prompt">
        <p>Connectez-vous pour ajouter un commentaire</p>
        <router-link to="/login" class="btn btn-primary">Se connecter</router-link>
      </div>

      <form v-else @submit.prevent="handleAddComment" class="comment-form">
        <div class="form-group">
          <label for="comment-input" class="form-label">Ajouter un commentaire</label>
          <textarea id="comment-input" v-model="newComment" class="form-textarea" rows="4"
            placeholder="Partagez votre avis sur ce document..." required :disabled="isSubmittingComment"></textarea>
        </div>
        <button type="submit" class="btn btn-primary" :disabled="isSubmittingComment || !newComment.trim()">
          {{ isSubmittingComment ? 'Envoi...' : 'Publier' }}
        </button>
      </form>

      <!-- Comments List -->
      <div class="comments-list">
        <div v-if="isLoadingComments" class="loading-state">
          <BaseSpinner size="medium" />
          <p>Chargement des commentaires...</p>
        </div>

        <div v-else-if="comments.length === 0" class="empty-state">
          <p>Aucun commentaire pour le moment. Soyez le premier à commenter !</p>
        </div>

        <div v-else class="comments-container">
          <div v-for="comment in comments" :key="comment.id" class="comment-item">
            <div class="comment-header">
              <span class="comment-author">{{ getCommentAuthor(comment) }}</span>
              <span class="comment-date">{{ formatDate(comment.created_at) }}</span>
            </div>
            <p class="comment-content">{{ comment.content }}</p>
            <div v-if="canDeleteComment(comment)" class="comment-actions">
              <button @click="handleDeleteComment(comment.id)" class="btn-delete"
                :disabled="isDeletingComment === comment.id">
                {{ isDeletingComment === comment.id ? 'Suppression...' : 'Supprimer' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui'
import { dbService, supabase } from '@/services/supabase'
import BaseSpinner from '@/components/common/BaseSpinner.vue'

// Props
const props = defineProps({
  documentId: {
    type: String,
    required: true
  },
  documentRating: {
    type: [Number, String],
    default: null
  },
  ratingCount: {
    type: Number,
    default: 0
  }
})

// Emits
const emit = defineEmits(['rating-updated', 'comment-added'])

// Stores
const authStore = useAuthStore()
const uiStore = useUIStore()

// State
const comments = ref([])
const isLoadingComments = ref(true)
const newComment = ref('')
const isSubmittingComment = ref(false)
const isDeletingComment = ref(null)
const userRating = ref(null)
const isSubmittingRating = ref(false)

// Real-time subscriptions
let commentsSubscription = null
let ratingsSubscription = null

// Computed
const canDeleteComment = computed(() => (comment) => {
  return authStore.user && comment.user_id === authStore.user.id
})

// Methods
const loadComments = async () => {
  try {
    const result = await dbService.getComments(props.documentId)
    if (result.success) {
      comments.value = result.data
    } else {
      throw new Error(result.error)
    }
  } catch (error) {
    console.error('Error loading comments:', error)
    uiStore.showNotification('Erreur lors du chargement des commentaires', 'error')
  } finally {
    isLoadingComments.value = false
  }
}

const loadUserRating = async () => {
  if (!authStore.isAuthenticated) return

  try {
    const result = await dbService.getUserRating(props.documentId)
    if (result.success && result.data) {
      userRating.value = result.data.rating
    }
  } catch (error) {
    console.error('Error loading user rating:', error)
  }
}

const handleAddComment = async () => {
  if (!newComment.value.trim()) return

  isSubmittingComment.value = true
  try {
    const result = await dbService.addComment(props.documentId, newComment.value)
    if (result.success) {
      newComment.value = ''
      await loadComments()
      emit('comment-added')
      uiStore.showNotification('Commentaire ajouté avec succès', 'success')
    } else {
      throw new Error(result.error)
    }
  } catch (error) {
    console.error('Error adding comment:', error)
    uiStore.showNotification('Erreur lors de l\'ajout du commentaire', 'error')
  } finally {
    isSubmittingComment.value = false
  }
}

const handleDeleteComment = async (commentId) => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) return

  isDeletingComment.value = commentId
  try {
    const result = await dbService.deleteComment(commentId)
    if (result.success) {
      await loadComments()
      uiStore.showNotification('Commentaire supprimé', 'success')
    } else {
      throw new Error(result.error || 'Erreur inconnue')
    }
  } catch (error) {
    console.error('Error deleting comment:', error)
    const errorMessage = error.message || 'Erreur lors de la suppression du commentaire'
    uiStore.showNotification(errorMessage, 'error')
  } finally {
    isDeletingComment.value = null
  }
}

const handleRating = async (rating) => {
  if (isSubmittingRating.value) return

  isSubmittingRating.value = true
  try {
    const result = await dbService.submitRating(props.documentId, rating)
    if (result.success) {
      userRating.value = rating
      emit('rating-updated')
      uiStore.showNotification('Note enregistrée', 'success')
    } else {
      throw new Error(result.error)
    }
  } catch (error) {
    console.error('Error submitting rating:', error)
    uiStore.showNotification('Erreur lors de l\'enregistrement de la note', 'error')
  } finally {
    isSubmittingRating.value = false
  }
}

const handleRemoveRating = async () => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer votre note ?')) return

  isSubmittingRating.value = true
  try {
    const result = await dbService.deleteRating(props.documentId)
    if (result.success) {
      userRating.value = null
      emit('rating-updated')
      uiStore.showNotification('Note supprimée', 'success')
    } else {
      throw new Error(result.error)
    }
  } catch (error) {
    console.error('Error removing rating:', error)
    uiStore.showNotification('Erreur lors de la suppression de la note', 'error')
  } finally {
    isSubmittingRating.value = false
  }
}

const getCommentAuthor = (comment) => {
  // For now, we'll use the user_id as a placeholder
  // In a real app, you'd fetch user info or store it with the comment
  return `Utilisateur ${comment.user_id.substring(0, 8)}`
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return "Aujourd'hui"
  } else if (diffDays === 1) {
    return 'Hier'
  } else if (diffDays < 7) {
    return `Il y a ${diffDays} jours`
  } else {
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
}

// Setup real-time subscriptions
const setupSubscriptions = () => {
  // Subscribe to comments changes
  commentsSubscription = supabase
    .channel(`comments:${props.documentId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'comments',
        filter: `document_id=eq.${props.documentId}`
      },
      () => {
        loadComments()
      }
    )
    .subscribe()

  // Subscribe to ratings changes
  ratingsSubscription = supabase
    .channel(`ratings:${props.documentId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'ratings',
        filter: `document_id=eq.${props.documentId}`
      },
      () => {
        emit('rating-updated')
      }
    )
    .subscribe()
}

// Lifecycle
onMounted(() => {
  loadComments()
  loadUserRating()
  setupSubscriptions()
})

onUnmounted(() => {
  // Cleanup subscriptions
  if (commentsSubscription) {
    supabase.removeChannel(commentsSubscription)
  }
  if (ratingsSubscription) {
    supabase.removeChannel(ratingsSubscription)
  }
})
</script>

<style scoped>
.comments-tab {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

/* Rating Section */
.rating-section {
  padding: var(--space-6);
}

.section-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-black);
  margin-bottom: var(--space-4);
}

.auth-prompt {
  text-align: center;
  padding: var(--space-6);
  background-color: var(--color-gray-50);
  border-radius: var(--radius-card);
}

.auth-prompt p {
  margin-bottom: var(--space-4);
  color: var(--color-gray-700);
}

.rating-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.document-rating-info {
  padding: var(--space-4);
  background-color: var(--color-gray-50);
  border-radius: var(--radius-card);
}

.average-rating {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.rating-value {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-black);
}

.rating-stars {
  display: flex;
  gap: 2px;
}

.star-display {
  font-size: var(--font-size-lg);
  color: var(--color-gray-300);
}

.star-filled {
  color: #FFD700;
}

.rating-count {
  font-size: var(--font-size-sm);
  color: var(--color-gray-600);
}

.user-rating {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.rating-label {
  font-weight: var(--font-weight-medium);
  color: var(--color-black);
}

.rating-input {
  display: flex;
  gap: var(--space-1);
}

.star-button {
  background: none;
  border: none;
  font-size: 2rem;
  color: var(--color-gray-300);
  cursor: pointer;
  transition: color var(--transition-fast);
  padding: var(--space-1);
}

.star-button:hover {
  color: #FFD700;
}

.star-button.star-active {
  color: #FFD700;
}

.star-button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

/* Comments Section */
.comments-section {
  padding: var(--space-6);
}

.comment-form {
  margin-bottom: var(--space-6);
  padding-bottom: var(--space-6);
  border-bottom: 1px solid var(--color-gray-200);
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

.form-textarea {
  width: 100%;
  padding: var(--space-3);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--radius-button);
  font-size: var(--font-size-base);
  font-family: inherit;
  resize: vertical;
  transition: border-color var(--transition-fast);
}

.form-textarea:focus {
  outline: none;
  border-color: var(--color-blue);
  box-shadow: var(--shadow-focus);
}

.form-textarea:disabled {
  background-color: var(--color-gray-100);
  cursor: not-allowed;
}

/* Comments List */
.comments-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.loading-state,
.empty-state {
  text-align: center;
  padding: var(--space-8);
  color: var(--color-gray-600);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
}

.comments-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.comment-item {
  padding: var(--space-4);
  background-color: var(--color-gray-50);
  border-radius: var(--radius-card);
  border: 1px solid var(--color-gray-200);
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-2);
}

.comment-author {
  font-weight: var(--font-weight-semibold);
  color: var(--color-black);
}

.comment-date {
  font-size: var(--font-size-sm);
  color: var(--color-gray-500);
}

.comment-content {
  color: var(--color-gray-800);
  line-height: 1.6;
  white-space: pre-wrap;
}

.comment-actions {
  margin-top: var(--space-3);
}

.btn-delete {
  font-size: var(--font-size-sm);
  color: var(--color-red-600);
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--space-1) var(--space-2);
  transition: color var(--transition-fast);
}

.btn-delete:hover {
  color: var(--color-red-700);
  text-decoration: underline;
}

.btn-delete:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

/* Buttons */
.btn {
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-button);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  text-decoration: none;
  transition: all var(--transition-fast);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: none;
}

.btn-primary {
  background-color: var(--color-black);
  color: var(--color-white);
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--color-gray-700);
}

.btn-secondary {
  background-color: transparent;
  color: var(--color-black);
  border: 1px solid var(--color-gray-300);
}

.btn-secondary:hover:not(:disabled) {
  background-color: var(--color-gray-100);
  border-color: var(--color-gray-400);
}

.btn-small {
  padding: var(--space-2) var(--space-4);
  font-size: var(--font-size-sm);
}

.btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

/* Responsive */
@media (max-width: 768px) {

  .rating-section,
  .comments-section {
    padding: var(--space-4);
  }

  .average-rating {
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
