<template>
  <div class="stat-card">
    <div class="stat-content" style="width: 100%">
      <div class="card-title">Chatbot</div>

      <div v-if="isLoading" class="loading-state">
        <BaseSpinner size="small" />
        <span>Chargement...</span>
      </div>

      <div v-else class="kpi-grid">
        <div class="kpi">
          <div class="kpi-label">Messages ce mois</div>
          <div class="kpi-value">{{ formattedMessages }}</div>
        </div>
        <div class="kpi">
          <div class="kpi-label">Coût ce mois</div>
          <div class="kpi-value">{{ formattedCost }}</div>
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
.card-title {
  font-size: var(--font-size-base);
  color: var(--color-gray-700);
  margin-bottom: var(--space-4);
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-6);
}

.kpi-label {
  font-size: var(--font-size-xs);
  color: var(--color-gray-600);
  margin-bottom: var(--space-1);
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


