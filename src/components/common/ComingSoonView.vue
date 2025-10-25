<template>
  <AppLayout :has-breadcrumbs="hasBreadcrumbs">
    <template v-if="hasBreadcrumbs" #breadcrumbs>
      <BreadcrumbNav :items="breadcrumbItems" />
    </template>

    <div class="coming-soon-container">
      <div class="coming-soon-content">
        <div class="icon-container">
          <svg class="construction-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 21L13.3186 8.62439M21 12.9375C18.8012 15.4287 15.5841 17 12 17C8.41592 17 5.19883 15.4287 3 12.9375M3 21L10.6814 8.62439M12 4C10.6193 4 9.5 5.11929 9.5 6.5C9.5 7.39675 9.97215 8.18322 10.6814 8.62439M12 4C13.3807 4 14.5 5.11929 14.5 6.5C14.5 7.39675 14.0279 8.18322 13.3186 8.62439M12 4V3M13.3186 8.62439C12.9358 8.86248 12.484 9 12 9C11.516 9 11.0642 8.86248 10.6814 8.62439" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>

        <h1 class="page-title">{{ pageTitle }}</h1>
        <p class="page-description">{{ pageDescription }}</p>

        <div class="status-info">
          <div class="status-badge">
            <span class="status-dot"></span>
            En cours de développement
          </div>
          <p class="status-text">
            Cette page sera bientôt disponible. Nous travaillons activement sur son contenu pour vous offrir la meilleure expérience possible.
          </p>
        </div>

        <div class="action-buttons">
          <router-link to="/" class="btn btn-primary">
            Retour à l'accueil
          </router-link>
          <router-link v-if="alternativeRoute" :to="alternativeRoute.path" class="btn btn-secondary">
            {{ alternativeRoute.label }}
          </router-link>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { computed } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import BreadcrumbNav from '@/components/layout/BreadcrumbNav.vue'

const props = defineProps({
  pageTitle: {
    type: String,
    default: 'Page en construction'
  },
  pageDescription: {
    type: String,
    default: 'Cette page est actuellement en cours de développement.'
  },
  breadcrumbItems: {
    type: Array,
    default: () => []
  },
  alternativeRoute: {
    type: Object,
    default: null
    // Expected format: { path: '/contact', label: 'Nous contacter' }
  }
})

const hasBreadcrumbs = computed(() => props.breadcrumbItems.length > 0)
</script>

<style scoped>
.coming-soon-container {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-8) var(--space-4);
}

.coming-soon-content {
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
}

.icon-container {
  margin-bottom: var(--space-6);
}

.construction-icon {
  width: 64px;
  height: 64px;
  color: var(--color-gray-400);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.page-title {
  font-size: var(--font-size-3xl);
  color: var(--color-black);
  margin-bottom: var(--space-4);
  font-weight: var(--font-weight-semibold);
}

.page-description {
  font-size: var(--font-size-lg);
  color: var(--color-gray-600);
  margin-bottom: var(--space-8);
  line-height: var(--line-height-relaxed);
}

.status-info {
  background-color: var(--color-gray-50);
  border-radius: var(--radius-card);
  padding: var(--space-6);
  margin-bottom: var(--space-8);
  border: 1px solid var(--color-gray-200);
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  background-color: var(--color-info-bg);
  color: var(--color-info);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-button);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  margin-bottom: var(--space-4);
}

.status-dot {
  width: 8px;
  height: 8px;
  background-color: var(--color-info);
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.status-text {
  font-size: var(--font-size-base);
  color: var(--color-gray-700);
  line-height: var(--line-height-normal);
  margin: 0;
}

.action-buttons {
  display: flex;
  gap: var(--space-4);
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-button);
  text-decoration: none;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  transition: all var(--transition-fast);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 140px;
}

.btn-primary {
  background-color: var(--color-black);
  color: var(--color-white);
  border: 2px solid var(--color-black);
}

.btn-primary:hover {
  background-color: var(--color-gray-800);
  border-color: var(--color-gray-800);
}

.btn-secondary {
  background-color: var(--color-white);
  color: var(--color-black);
  border: 2px solid var(--color-gray-300);
}

.btn-secondary:hover {
  background-color: var(--color-gray-50);
  border-color: var(--color-gray-400);
}

/* Responsive Design */
@media (max-width: 768px) {
  .coming-soon-container {
    padding: var(--space-6) var(--space-4);
  }

  .page-title {
    font-size: var(--font-size-2xl);
  }

  .page-description {
    font-size: var(--font-size-base);
  }

  .construction-icon {
    width: 48px;
    height: 48px;
  }

  .action-buttons {
    flex-direction: column;
    align-items: center;
  }

  .btn {
    width: 100%;
    max-width: 280px;
  }
}

@media (max-width: 480px) {
  .status-info {
    padding: var(--space-4);
  }

  .status-badge {
    font-size: var(--font-size-xs);
    padding: var(--space-1) var(--space-3);
  }
}
</style>
