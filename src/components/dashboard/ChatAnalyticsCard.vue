<template>
  <div class="stat-card">
    <div class="stat-icon">
      <Icon name="robot" size="md" color="#ffffff" decorative />
    </div>
    <div class="stat-content">
      <div v-if="isLoading" class="loading-state">
        <BaseSpinner size="small" />
        <span>Chargement...</span>
      </div>

      <div v-else class="kpi-grid">
        <div class="kpi">
          <div class="kpi-value">{{ formattedMessages }}</div>
          <div class="kpi-label">Messages ce mois</div>
        </div>
        <div class="kpi">
          <div class="kpi-value">{{ formattedCost }}</div>
          <div class="kpi-label">Coût ce mois</div>
        </div>
      </div>

      <div v-if="error" class="error-text">{{ error }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import BaseSpinner from '@/components/common/BaseSpinner.vue'
import { dbService } from '@/services/supabase'
import Icon from '@/components/ui/Icon.vue'

const isLoading = ref(true)
const error = ref('')
const messageCount = ref(0)
const costTotal = ref(0)

const now = new Date()
const year = now.getUTCFullYear()
const month = now.getUTCMonth() + 1 // 1-12

const formattedMessages = computed(() => new Intl.NumberFormat('fr-FR').format(messageCount.value))
const formattedCost = computed(() => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }).format(costTotal.value))

onMounted(async () => {
  try {
    const result = await dbService.getUserMonthlyChatUsage(year, month)
    if (result.success) {
      messageCount.value = result.data.messageCount || 0
      costTotal.value = Number(result.data.costTotal || 0)
    } else {
      error.value = result.error || 'Erreur lors du chargement des métriques.'
    }
  } catch (e) {
    error.value = e?.message || 'Erreur lors du chargement des métriques.'
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>

/* Align structure and visuals with other .stat-card usage */
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

.stat-content { flex: 1; }

.stat-heading {
  font-size: var(--font-size-base);
  color: var(--color-gray-700);
  margin-bottom: var(--space-4);
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-6);
}

.kpi {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-1);
}

.kpi-label {
  font-size: var(--font-size-xs);
  color: var(--color-gray-600);
}

.kpi-value {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-black);
}

.loading-state {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.error-text {
  margin-top: var(--space-3);
  color: var(--color-red);
  font-size: var(--font-size-xs);
}
</style>


