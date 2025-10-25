<template>
  <div class="chat-header">
    <div v-if="showClearConfirm" class="confirm-overlay">
      <p class="confirm-text">Commencer une nouvelle conversation ?</p>
      <div class="confirm-actions">
        <Button variant="ghost" size="sm" @click="cancelClear">
          Annuler
        </Button>
        <Button variant="primary" size="sm" @click="confirmClear">
          Confirmer
        </Button>
      </div>
    </div>

    <template v-else>
      <div class="header-content">
        <div class="header-icon">
          <MessageSquare :size="20" />
        </div>
        <div class="header-info">
          <h3 class="header-title">Assistant PLU</h3>
          <p v-if="documentName" class="header-subtitle">{{ documentName }}</p>
        </div>
      </div>
      <div class="header-actions">
        <Button variant="ghost" size="icon" @click="handleClear" title="Nouvelle conversation">
          <RotateCcw :size="18" />
        </Button>
        <Button variant="ghost" size="icon" @click="handleClose" title="Fermer">
          <X :size="18" />
        </Button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { MessageSquare, X, RotateCcw } from 'lucide-vue-next'
import Button from '@/components/ui/Button.vue'

const emit = defineEmits(['close', 'clear'])

defineProps({
  documentName: {
    type: String,
    default: '',
  },
})

const showClearConfirm = ref(false)

const handleClose = () => {
  emit('close')
}

const handleClear = () => {
  showClearConfirm.value = true
}

const confirmClear = () => {
  showClearConfirm.value = false
  emit('clear')
}

const cancelClear = () => {
  showClearConfirm.value = false
}
</script>

<style scoped>
.chat-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-gray-200);
  background-color: var(--color-white);
  border-top-left-radius: var(--radius-card);
  border-top-right-radius: var(--radius-card);
  min-height: 72px;
}

.confirm-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  background-color: var(--color-white);
  padding: var(--space-4);
  z-index: 10;
  animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.confirm-text {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
  color: var(--color-black);
  margin: 0;
  text-align: center;
}

.confirm-actions {
  display: flex;
  gap: var(--space-2);
}

.header-content {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex: 1;
  min-width: 0;
}

.header-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background-color: var(--color-black);
  color: var(--color-white);
  border-radius: 50%;
  flex-shrink: 0;
}

.header-info {
  flex: 1;
  min-width: 0;
}

.header-title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--color-black);
  margin: 0;
}

.header-subtitle {
  font-size: var(--font-size-sm);
  color: var(--color-gray-600);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .chat-header {
    padding: var(--space-3);
  }

  .header-icon {
    width: 36px;
    height: 36px;
  }

  .header-title {
    font-size: var(--font-size-sm);
  }

  .header-subtitle {
    font-size: var(--font-size-xs);
  }

  .confirm-text {
    font-size: var(--font-size-sm);
  }
}
</style>
