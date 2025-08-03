<template>
  <AppLayout>
    <div class="main-content">
      <BreadcrumbNav :items="breadcrumbItems" />

      <!-- Welcome Section -->
      <section class="welcome-section">
        <div class="welcome-header">
          <h1 class="page-title">
            Tableau de bord
          </h1>
          <p class="welcome-message">
            Bonjour {{ userName }}, bienvenue sur votre tableau de bord !
          </p>
        </div>
        <div class="quick-actions">
          <router-link to="/plu-repository" class="action-card">
            <div class="action-icon">🏛️</div>
            <h3>Parcourir les PLU</h3>
            <p>Explorer les documents d'urbanisme</p>
          </router-link>
          <router-link to="/profile" class="action-card">
            <div class="action-icon">👤</div>
            <h3>Mon Profil</h3>
            <p>Gérer mes informations</p>
          </router-link>
          <router-link to="/contact" class="action-card">
            <div class="action-icon">💬</div>
            <h3>Contact</h3>
            <p>Nous contacter</p>
          </router-link>
        </div>
      </section>

      <!-- Stats Grid -->
      <section class="stats-section">
        <h2 class="section-title">Mes statistiques</h2>
        <div class="stats-grid">

          <div class="stat-card">
            <div class="stat-icon">💬</div>
            <div class="stat-content">
              <div class="stat-number">{{ userStats.commentsCount }}</div>
              <div class="stat-label">Commentaires postés</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">⭐</div>
            <div class="stat-content">
              <div class="stat-number">{{ userStats.ratingsCount }}</div>
              <div class="stat-label">Évaluations données</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">📥</div>
            <div class="stat-content">
              <div class="stat-number">{{ userStats.downloadsCount }}</div>
              <div class="stat-label">Téléchargements</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Recent Activity -->
      <section class="activity-section">
        <h2 class="section-title">Activité récente</h2>
        <div class="activity-grid">
          <!-- Recent Comments -->
          <div class="activity-card">
            <h3 class="activity-title">
              <span class="activity-icon">💭</span>
              Mes derniers commentaires
            </h3>
            <div v-if="isLoadingComments" class="loading-state">
              <BaseSpinner size="small" />
              <span>Chargement...</span>
            </div>
            <div v-else-if="recentComments.length === 0" class="empty-state">
              <p>Aucun commentaire récent</p>
              <router-link to="/plu-repository" class="btn btn-secondary btn-sm">
                Parcourir les PLU
              </router-link>
            </div>
            <div v-else class="comment-list">
              <div 
                v-for="comment in recentComments" 
                :key="comment.id"
                class="comment-item"
              >
                <div class="comment-meta">
                  <span class="comment-date">{{ formatDate(comment.created_at) }}</span>
                  <span class="document-info">{{ getDocumentDisplayName(comment.documents) }}</span>
                </div>
                <p class="comment-text">{{ truncateText(comment.content, 120) }}</p>
              </div>
            </div>
          </div>

          <!-- Recent Downloads -->
          <div class="activity-card">
            <h3 class="activity-title">
              <span class="activity-icon">📥</span>
              Téléchargements récents
            </h3>
            <div v-if="isLoadingDownloads" class="loading-state">
              <BaseSpinner size="small" />
              <span>Chargement...</span>
            </div>
            <div v-else-if="recentDownloads.length === 0" class="empty-state">
              <p>Aucun téléchargement récent</p>
            </div>
            <div v-else class="download-list">
              <div 
                v-for="download in recentDownloads" 
                :key="download.id"
                class="download-item"
              >
                <div class="download-meta">
                  <span class="download-date">{{ formatDate(download.created_at) }}</span>
                  <span class="download-type">{{ download.type || 'PDF' }}</span>
                </div>
                <span class="download-info">
                  {{ getDocumentDisplayName(download.documents) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Account Info -->
      <section class="account-section">
        <h2 class="section-title">Informations du compte</h2>
        <div class="account-info-card">
          <div class="account-details">
            <div class="account-item">
              <strong>Email :</strong>
              <span>{{ authStore.user?.email }}</span>
            </div>
            <div class="account-item">
              <strong>Membre depuis :</strong>
              <span>{{ formatDate(authStore.user?.created_at) }}</span>
            </div>
            <div class="account-item">
              <strong>Dernière connexion :</strong>
              <span>{{ formatDate(authStore.user?.last_sign_in_at) }}</span>
            </div>
          </div>
          <div class="account-actions">
            <router-link to="/profile" class="btn btn-primary">
              Gérer mon profil
            </router-link>
          </div>
        </div>
      </section>
    </div>
  </AppLayout>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui'
import { supabase } from '@/services/supabase'
import AppLayout from '@/components/layout/AppLayout.vue'
import BreadcrumbNav from '@/components/layout/BreadcrumbNav.vue'
import BaseSpinner from '@/components/common/BaseSpinner.vue'

export default {
  name: 'DashboardView',

  components: {
    AppLayout,
    BreadcrumbNav,
    BaseSpinner
  },

  setup() {
    const authStore = useAuthStore()
    const uiStore = useUIStore()

    // Reactive data
    const isLoadingComments = ref(false)
    const isLoadingDownloads = ref(false)
    const recentComments = ref([])
    const recentDownloads = ref([])
    const userStats = ref({
      commentsCount: 0,
      ratingsCount: 0,
      downloadsCount: 0
    })

    // Computed
    const userName = computed(() => {
      return authStore.user?.user_metadata?.name || 
             authStore.user?.email?.split('@')[0] || 
             'Utilisateur'
    })

    const breadcrumbItems = [
      { label: 'Tableau de bord', to: '/dashboard' }
    ]

    // Methods
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A'
      const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }
      return new Date(dateString).toLocaleDateString('fr-FR', options)
    }

    const truncateText = (text, maxLength) => {
      if (!text) return ''
      return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
    }

    const getDocumentDisplayName = (document) => {
      if (!document) return 'Document inconnu'
      
      const cityName = document.zonings?.cities?.name || 'Ville inconnue'
      const zoningName = document.zonings?.name || 'Zonage inconnu'
      const zoneName = document.zones?.name
      
      // Capitalize city name
      const formattedCity = cityName.charAt(0).toUpperCase() + cityName.slice(1).toLowerCase()
      
      if (zoneName) {
        return `${formattedCity} - ${zoningName} - ${zoneName}`
      } else {
        return `${formattedCity} - ${zoningName}`
      }
    }

    // Load user statistics
    const loadUserStats = async () => {
      if (!authStore.user?.id) return

      try {
        // Get comments count
        const { count: commentsCount } = await supabase
          .from('comments')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', authStore.user.id)

        // Get ratings count  
        const { count: ratingsCount } = await supabase
          .from('ratings')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', authStore.user.id)

        // Get downloads count
        const { count: downloadsCount } = await supabase
          .from('downloads')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', authStore.user.id)

        userStats.value = {
          commentsCount: commentsCount || 0,
          ratingsCount: ratingsCount || 0,
          downloadsCount: downloadsCount || 0
        }
      } catch (error) {
        console.error('Error loading user stats:', error)
      }
    }

    // Load recent comments
    const loadRecentComments = async () => {
      if (!authStore.user?.id) return

      isLoadingComments.value = true
      try {
        const { data, error } = await supabase
          .from('comments')
          .select(`
            id,
            content,
            created_at,
            document_id,
            documents!inner (
              id,
              zonings!inner (
                name,
                cities!inner (
                  name
                )
              ),
              zones (
                name
              )
            )
          `)
          .eq('user_id', authStore.user.id)
          .order('created_at', { ascending: false })
          .limit(5)

        if (error) throw error

        recentComments.value = data || []
      } catch (error) {
        console.error('Error loading recent comments:', error)
      } finally {
        isLoadingComments.value = false
      }
    }

    // Load recent downloads
    const loadRecentDownloads = async () => {
      if (!authStore.user?.id) return

      isLoadingDownloads.value = true
      try {
        const { data, error } = await supabase
          .from('downloads')
          .select(`
            id,
            created_at,
            type,
            document_id,
            documents!inner (
              id,
              zonings!inner (
                name,
                cities!inner (
                  name
                )
              ),
              zones (
                name
              )
            )
          `)
          .eq('user_id', authStore.user.id)
          .order('created_at', { ascending: false })
          .limit(5)

        if (error) throw error

        recentDownloads.value = data || []
      } catch (error) {
        console.error('Error loading recent downloads:', error)
      } finally {
        isLoadingDownloads.value = false
      }
    }

    // Load all dashboard data
    const loadDashboardData = async () => {
      await Promise.all([
        loadUserStats(),
        loadRecentComments(),
        loadRecentDownloads()
      ])
    }

    // Lifecycle
    onMounted(() => {
      if (authStore.user) {
        loadDashboardData()
      }
    })

    return {
      authStore,
      userName,
      breadcrumbItems,
      userStats,
      recentComments,
      recentDownloads,
      isLoadingComments,
      isLoadingDownloads,
      formatDate,
      truncateText,
      getDocumentDisplayName
    }
  }
}
</script>

<style scoped>
.main-content {
  max-width: 1200px;
  margin: var(--space-8) auto;
  padding: 0 var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

/* Welcome Section */
.welcome-section {
  background-color: var(--color-white);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-sm);
  padding: var(--space-8);
}

.welcome-header {
  text-align: center;
  margin-bottom: var(--space-8);
}

.page-title {
  font-size: var(--font-size-3xl);
  color: var(--color-black);
  margin-bottom: var(--space-4);
  line-height: 1.2;
}

.welcome-message {
  font-size: var(--font-size-lg);
  color: var(--color-gray-700);
  line-height: 1.5;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--space-6);
  margin-top: var(--space-8);
}

.action-card {
  background-color: var(--color-gray-50);
  border-radius: var(--radius-card);
  padding: var(--space-6);
  text-align: center;
  text-decoration: none;
  color: inherit;
  transition: all var(--transition-fast);
  border: 2px solid transparent;
}

.action-card:hover {
  background-color: var(--color-white);
  border-color: var(--color-blue);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.action-icon {
  font-size: 2.5rem;
  margin-bottom: var(--space-4);
}

.action-card h3 {
  font-size: var(--font-size-lg);
  color: var(--color-black);
  margin-bottom: var(--space-2);
}

.action-card p {
  font-size: var(--font-size-sm);
  color: var(--color-gray-600);
}

/* Stats Section */
.stats-section {
  background-color: var(--color-white);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-sm);
  padding: var(--space-8);
}

.section-title {
  font-size: var(--font-size-xl);
  color: var(--color-black);
  margin-bottom: var(--space-6);
  padding-bottom: var(--space-3);
  border-bottom: 2px solid var(--color-gray-100);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-6);
}

.stat-card {
  background-color: var(--color-gray-50);
  border-radius: var(--radius-card);
  padding: var(--space-6);
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.stat-icon {
  font-size: 2rem;
  background-color: var(--color-blue);
  color: white;
  width: 60px;
  height: 60px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-black);
  line-height: 1;
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--color-gray-600);
  margin-top: var(--space-1);
}

/* Activity Section */
.activity-section {
  background-color: var(--color-white);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-sm);
  padding: var(--space-8);
}

.activity-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: var(--space-6);
}

.activity-card {
  background-color: var(--color-gray-50);
  border-radius: var(--radius-card);
  padding: var(--space-6);
}

.activity-title {
  font-size: var(--font-size-lg);
  color: var(--color-black);
  margin-bottom: var(--space-4);
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.activity-icon {
  font-size: 1.5rem;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: var(--space-8);
  color: var(--color-gray-600);
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
}

.comment-list,
.download-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.comment-item,
.download-item {
  padding: var(--space-4);
  background-color: var(--color-white);
  border-radius: var(--radius-button);
  border-left: 4px solid var(--color-blue);
}

.comment-meta,
.download-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-2);
  font-size: var(--font-size-xs);
  color: var(--color-gray-500);
}

.document-info,
.download-info {
  color: var(--color-gray-600);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.comment-text {
  font-size: var(--font-size-sm);
  color: var(--color-gray-700);
  line-height: 1.4;
  margin: 0;
}

.download-type {
  background-color: var(--color-gray-200);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-button);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

/* Account Section */
.account-section {
  background-color: var(--color-white);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-sm);
  padding: var(--space-8);
}

.account-info-card {
  background-color: var(--color-gray-50);
  border-radius: var(--radius-card);
  padding: var(--space-6);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-6);
}

.account-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.account-item {
  display: flex;
  gap: var(--space-3);
  font-size: var(--font-size-sm);
}

.account-item strong {
  color: var(--color-black);
  font-weight: var(--font-weight-medium);
  min-width: 150px;
}

.account-item span {
  color: var(--color-gray-700);
}

.account-actions {
  flex-shrink: 0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .main-content {
    padding: 0 var(--space-3);
    gap: var(--space-6);
  }

  .welcome-section,
  .stats-section,
  .activity-section,
  .account-section {
    padding: var(--space-6);
  }

  .page-title {
    font-size: var(--font-size-2xl);
  }

  .quick-actions {
    grid-template-columns: 1fr;
    gap: var(--space-4);
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: var(--space-4);
  }

  .activity-grid {
    grid-template-columns: 1fr;
    gap: var(--space-4);
  }

  .account-info-card {
    flex-direction: column;
    align-items: stretch;
    text-align: center;
  }

  .stat-card {
    padding: var(--space-4);
  }

  .stat-icon {
    width: 50px;
    height: 50px;
    font-size: 1.5rem;
  }

  .stat-number {
    font-size: var(--font-size-xl);
  }
}
</style>
