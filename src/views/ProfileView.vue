<template>
  <AppLayout>
    <div class="main-content">
      <BreadcrumbNav :items="breadcrumbItems" />

      <section class="profile-header-section">
        <h1 class="page-title">Mon Profil</h1>
        <p class="page-subtitle">
          Gérez vos informations personnelles et préférences
        </p>
      </section>

      <div class="profile-content-grid">
        <!-- Profile Forms Section -->
        <section class="profile-forms-section">
          <!-- Preferences: Theme -->
          <div class="profile-form card">
            <h3 class="form-title">Préférences</h3>
            <div class="pref-row">
              <div class="pref-item">
                <div class="pref-label">Thème</div>
                <div class="pref-control">
                  <div class="theme-mode">
                    <button class="mode-btn" :class="{ active: theme === 'light' }"
                      @click="setTheme('light')">Clair</button>
                    <button class="mode-btn" :class="{ active: theme === 'dark' }"
                      @click="setTheme('dark')">Sombre</button>
                    <button class="mode-btn" :class="{ active: theme === 'auto' }"
                      @click="setTheme('auto')">Auto</button>
                  </div>
                  <button class="theme-switch" :class="{ 'is-dark': isDark }" :aria-pressed="isDark.toString()"
                    @click="toggleDark" aria-label="Basculer le thème clair/sombre">
                    <span class="switch-knob" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Personal Information Form -->
          <form @submit.prevent="handleUpdateProfile" class="profile-form card">
            <h3 class="form-title">Informations personnelles</h3>

            <div class="form-group">
              <label for="pseudo" class="form-label">Pseudo</label>
              <input id="pseudo" v-model="form.pseudo" type="text" class="form-input" :disabled="isUpdating"
                placeholder="Votre pseudo public" />
              <small class="form-help">Ce pseudo sera affiché à côté de vos commentaires.</small>
            </div>

            <div class="form-group">
              <label for="name" class="form-label">Nom complet</label>
              <input id="name" v-model="form.name" type="text" class="form-input" :disabled="isUpdating" />
            </div>

            <div class="form-group">
              <label for="email" class="form-label">Adresse email</label>
              <input id="email" v-model="form.email" type="email" class="form-input" disabled />
              <small class="form-help">L'email ne peut pas être modifié</small>
            </div>

            <button type="submit" :disabled="isUpdating" class="btn btn-primary">
              <BaseSpinner v-if="isUpdating" size="small" color="white" />
              {{ isUpdating ? 'Mise à jour...' : 'Mettre à jour' }}
            </button>
          </form>

          <!-- Password Change Form -->
          <form @submit.prevent="handleChangePassword" class="profile-form card">
            <h3 class="form-title">Changer le mot de passe</h3>

            <div class="form-group">
              <label for="current-password" class="form-label">Mot de passe actuel</label>
              <input id="current-password" v-model="passwordForm.currentPassword" type="password" class="form-input"
                :disabled="isChangingPassword" />
            </div>

            <div class="form-group">
              <label for="new-password" class="form-label">Nouveau mot de passe</label>
              <input id="new-password" v-model="passwordForm.newPassword" type="password" class="form-input"
                :disabled="isChangingPassword" />
            </div>

            <div class="form-group">
              <label for="confirm-password" class="form-label">Confirmer le mot de passe</label>
              <input id="confirm-password" v-model="passwordForm.confirmPassword" type="password" class="form-input"
                :disabled="isChangingPassword" />
            </div>

            <button type="submit" :disabled="!canChangePassword" class="btn btn-primary">
              <BaseSpinner v-if="isChangingPassword" size="small" color="white" />
              {{ isChangingPassword ? 'Modification...' : 'Changer le mot de passe' }}
            </button>
          </form>
        </section>

        <!-- Account Info & Actions Section -->
        <section class="account-info-section">
          <div class="info-card card">
            <h3 class="info-title">Informations du compte</h3>
            <div class="info-items">
              <div class="info-item">
                <strong>Statut :</strong>
                <span class="status-active">Actif</span>
              </div>
              <div class="info-item">
                <strong>Membre depuis :</strong>
                <span>{{ formatDate(authStore.user?.created_at) }}</span>
              </div>
              <div class="info-item">
                <strong>Dernière connexion :</strong>
                <span>{{ formatDate(authStore.user?.last_sign_in_at) }}</span>
              </div>
            </div>
          </div>

          <div class="account-actions-card card">
            <h3 class="info-title">Actions du compte</h3>
            <div class="account-actions">
              <button @click="handleLogout" class="btn btn-secondary action-button-full-width">
                Se déconnecter
              </button>
              <button @click="showDeleteConfirm = true" class="btn btn-danger action-button-full-width">
                Supprimer le compte
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteConfirm" class="modal-overlay">
      <div class="modal-content card">
        <h3 class="modal-title">Confirmer la suppression</h3>
        <p class="modal-message">Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.</p>
        <div class="modal-actions">
          <button @click="showDeleteConfirm = false" class="btn btn-secondary">
            Annuler
          </button>
          <button @click="handleDeleteAccount" class="btn btn-danger">
            Supprimer définitivement
          </button>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui'
import { dbService } from '@/services/supabase'
import AppLayout from '@/components/layout/AppLayout.vue'
import BreadcrumbNav from '@/components/layout/BreadcrumbNav.vue'
import BaseSpinner from '@/components/common/BaseSpinner.vue'

export default {
  name: 'ProfileView',

  components: {
    AppLayout,
    BreadcrumbNav,
    BaseSpinner
  },

  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const uiStore = useUIStore()
    // Theme control for preferences section
    const theme = computed(() => uiStore.theme)
    const effectiveTheme = computed(() => {
      if (theme.value === 'auto') {
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        return prefersDark ? 'dark' : 'light'
      }
      return theme.value
    })
    const isDark = computed(() => effectiveTheme.value === 'dark')
    const setTheme = (value) => uiStore.setTheme(value)
    const toggleDark = () => uiStore.setTheme(isDark.value ? 'light' : 'dark')

    const isUpdating = ref(false)
    const isChangingPassword = ref(false)
    const showDeleteConfirm = ref(false)

    const form = reactive({
      name: authStore.user?.user_metadata?.name || '',
      email: authStore.user?.email || '',
      pseudo: ''
    })

    const passwordForm = reactive({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })

    const breadcrumbItems = [
      { label: 'Profil', to: '/profile' }
    ]

    const canChangePassword = computed(() => {
      return passwordForm.currentPassword &&
        passwordForm.newPassword &&
        passwordForm.confirmPassword &&
        passwordForm.newPassword === passwordForm.confirmPassword &&
        !isChangingPassword.value
    })

    const formatDate = (dateString) => {
      if (!dateString) return 'N/A'
      const options = { year: 'numeric', month: 'long', day: 'numeric' }
      return new Date(dateString).toLocaleDateString('fr-FR', options)
    }

    /**
     * Load current profile (pseudo) from database
     */
    const loadProfile = async () => {
      try {
        const userId = authStore.user?.id
        if (!userId) return
        const res = await dbService.getUserProfile(userId)
        if (res.success && res.data) {
          form.pseudo = res.data.pseudo || ''
        }
      } catch (e) {
        console.warn('Unable to load profile:', e)
      }
    }

    /**
     * Handle profile update (name + pseudo)
     */
    const handleUpdateProfile = async () => {
      if (isUpdating.value) return
      isUpdating.value = true
      try {
        // 1) Update Supabase Auth user metadata (name)
        const authUpdate = await authStore.updateProfile({ name: form.name, full_name: form.name })
        if (authUpdate?.error) throw authUpdate.error

        // 2) Upsert pseudo into public.profiles
        const userId = authStore.user?.id
        if (userId) {
          const dbUpdate = await dbService.updateUserProfile(userId, { pseudo: form.pseudo })
          if (!dbUpdate.success) throw new Error(dbUpdate.error)
        }

        uiStore.showNotification('Votre profil a été mis à jour.', 'success')
      } catch (error) {
        console.error('Error updating profile:', error)
        uiStore.showNotification(`Erreur lors de la mise à jour : ${error.message || error.description || 'Une erreur inattendue est survenue.'}`, 'error')
      } finally {
        isUpdating.value = false
      }
    }

    /**
     * Handle password change
     */
    const handleChangePassword = async () => {
      if (isChangingPassword.value || !canChangePassword.value) return
      isChangingPassword.value = true
      try {
        const { error } = await authStore.changePassword(passwordForm.newPassword)
        if (error) {
          throw error
        }
        uiStore.showNotification('Votre mot de passe a été mis à jour.', 'success')
        // Clear form
        passwordForm.currentPassword = ''
        passwordForm.newPassword = ''
        passwordForm.confirmPassword = ''
      } catch (error) {
        console.error('Error changing password:', error)
        uiStore.showNotification(`Erreur lors du changement de mot de passe : ${error.message || error.description || 'Une erreur inattendue est survenue.'}`, 'error')
      } finally {
        isChangingPassword.value = false
      }
    }

    /**
     * Handle user logout
     */
    const handleLogout = async () => {
      try {
        await authStore.logout()
        await router.push('/')
        uiStore.showNotification('Vous avez été déconnecté.', 'info')
      } catch (error) {
        console.error('Logout error:', error)
        uiStore.showNotification(`Erreur lors de la déconnexion : ${error.message || error.description || 'Une erreur inattendue est survenue.'}`, 'error')
      }
    }

    /**
     * Handle account deletion
     */
    const handleDeleteAccount = async () => {
      showDeleteConfirm.value = false // Close modal immediately
      try {
        // This operation should ideally be handled by a secure backend function
        // For now, we simulate a simple delete or notify the user.
        uiStore.showNotification('La suppression de compte est en cours de développement. Veuillez contacter le support si vous souhaitez supprimer votre compte.', 'info')
        // In a real app, you'd call an API like:
        // await authStore.deleteAccount();
        // await router.push('/');
      } catch (error) {
        console.error('Account deletion error:', error)
        uiStore.showNotification(`Erreur lors de la suppression du compte : ${error.message || error.description || 'Une erreur inattendue est survenue.'}`, 'error')
      }
    }

    onMounted(() => {
      loadProfile()
    })

    return {
      authStore,
      theme,
      effectiveTheme,
      isDark,
      setTheme,
      toggleDark,
      form,
      passwordForm,
      isUpdating,
      isChangingPassword,
      showDeleteConfirm,
      breadcrumbItems,
      canChangePassword,
      formatDate,
      handleUpdateProfile,
      handleChangePassword,
      handleLogout,
      handleDeleteAccount,
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

.profile-header-section {
  text-align: center;
  padding: var(--space-8) var(--space-4);
  background-color: var(--color-white);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-sm);
}

.page-title {
  font-size: var(--font-size-3xl);
  color: var(--color-color-black);
  margin-bottom: var(--space-4);
  line-height: 1.2;
}

.page-subtitle {
  font-size: var(--font-size-lg);
  color: var(--color-gray-700);
  line-height: 1.5;
}

.profile-content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: var(--space-8);
  align-items: start;
}

@media (max-width: 1024px) {
  .profile-content-grid {
    grid-template-columns: 1fr;
  }
}

/* Forms Section */
.profile-forms-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.profile-form {
  padding: var(--space-8);
  border-radius: var(--radius-card);
  background-color: var(--color-white);
  box-shadow: var(--shadow-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.pref-row {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.pref-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
}

.pref-label {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
  color: var(--color-gray-700);
}

.pref-control {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.theme-mode {
  display: inline-flex;
  background: var(--color-gray-100);
  border: 1px solid var(--color-gray-300);
  border-radius: 999px;
  padding: 3px;
}

.mode-btn {
  background: transparent;
  border: none;
  color: var(--color-black);
  padding: 6px 10px;
  border-radius: 999px;
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.mode-btn.active {
  background: var(--color-white);
  box-shadow: var(--shadow-sm);
}

/* Elegant theme switch (duplicate of header style, kept local for cohesion) */
.theme-switch {
  position: relative;
  width: 44px;
  height: 24px;
  border-radius: 999px;
  border: 1px solid var(--color-gray-300);
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.02), rgba(0, 0, 0, 0.06)), var(--color-white);
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: background-color 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
  display: inline-flex;
  align-items: center;
  padding: 0 3px;
}

.theme-switch:hover {
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.08);
}

.theme-switch .switch-knob {
  position: absolute;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--color-white);
  border: 1px solid var(--color-gray-300);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  left: 3px;
  transition: left 0.25s ease, background-color 0.25s ease, border-color 0.25s ease;
}

.theme-switch.is-dark {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.04), rgba(0, 0, 0, 0.2)), var(--color-gray-200);
  border-color: var(--color-gray-400);
}

.theme-switch.is-dark .switch-knob {
  left: 23px;
  background: var(--color-gray-600);
  border-color: var(--color-gray-400);
}

.form-title {
  font-size: var(--font-size-xl);
  color: var(--color-color-black);
  margin-bottom: var(--space-4);
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

.form-input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--radius-button);
  background-color: var(--color-white);
  font-size: var(--font-size-md);
  color: var(--color-color-black);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.form-input:focus {
  outline: none;
  border-color: var(--color-blue);
  box-shadow: var(--shadow-focus);
}

.form-input:disabled {
  background-color: var(--color-gray-100);
  color: var(--color-gray-500);
  cursor: not-allowed;
}

.form-help {
  font-size: var(--font-size-xs);
  color: var(--color-gray-500);
  margin-top: var(--space-1);
}

/* Account Info Section */
.account-info-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.info-card,
.account-actions-card {
  padding: var(--space-8);
  border-radius: var(--radius-card);
  background-color: var(--color-white);
  box-shadow: var(--shadow-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.info-title {
  font-size: var(--font-size-xl);
  color: var(--color-color-black);
  margin-bottom: var(--space-4);
}

.info-items {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.info-item {
  font-size: var(--font-size-md);
  color: var(--color-gray-700);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: var(--space-2);
  border-bottom: 1px dashed var(--color-gray-200);
}

.info-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.info-item strong {
  color: var(--color-color-black);
  font-weight: var(--font-weight-medium);
}

.status-active {
  color: var(--color-green-600);
  font-weight: var(--font-weight-semibold);
}

.account-actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.action-button-full-width {
  width: 100%;
}

/* Modal Styling */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  padding: var(--space-8);
  border-radius: var(--radius-card);
  background-color: var(--color-white);
  box-shadow: var(--shadow-lg);
  max-width: 500px;
  width: 90%;
  text-align: center;
  position: relative;
}

.modal-title {
  font-size: var(--font-size-xl);
  color: var(--color-red-600);
  margin-bottom: var(--space-4);
}

.modal-message {
  font-size: var(--font-size-md);
  color: var(--color-gray-700);
  margin-bottom: var(--space-8);
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  justify-content: center;
  gap: var(--space-4);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .profile-header-section {
    padding: var(--space-6) var(--space-4);
  }

  .page-title {
    font-size: var(--font-size-2xl);
  }

  .page-subtitle {
    font-size: var(--font-size-md);
  }

  .profile-form,
  .info-card,
  .account-actions-card {
    padding: var(--space-6);
  }

  .form-title,
  .info-title {
    font-size: var(--font-size-lg);
  }

  .modal-content {
    padding: var(--space-6);
  }

  .modal-title {
    font-size: var(--font-size-lg);
  }

  .modal-message {
    font-size: var(--font-size-sm);
  }

  .modal-actions {
    flex-direction: column;
    gap: var(--space-3);
  }
}
</style>
