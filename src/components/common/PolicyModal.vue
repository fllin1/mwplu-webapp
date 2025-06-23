<!-- src/components/common/PolicyModal.vue -->
<template>
  <div v-if="visible" class="modal-overlay" @click.self="close">
    <div class="modal-container">
      <div class="modal-header">
        <h2 class="modal-title">{{ title }}</h2>
        <button class="close-button" @click="close">&times;</button>
      </div>
      <div class="modal-content" v-html="content"></div>
      <div class="modal-footer">
        <button class="button-primary" @click="close">Fermer</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['close'])

const close = () => {
  emit('close')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.modal-container {
  background-color: var(--color-white);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-lg);
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4) var(--space-6);
  border-bottom: 1px solid var(--color-gray-200);
}

.modal-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  font-size: 2.5rem;
  line-height: 1;
  cursor: pointer;
  color: var(--color-gray-500);
  padding: 0;
}

.modal-content {
  padding: var(--space-6);
  overflow-y: auto;
  flex-grow: 1;
}

.modal-content :deep(h1),
.modal-content :deep(h2) {
  margin-top: var(--space-6);
  margin-bottom: var(--space-3);
  font-weight: var(--font-weight-bold);
}
.modal-content :deep(h1) {
  font-size: var(--font-size-2xl);
}
.modal-content :deep(h2) {
  font-size: var(--font-size-xl);
}
.modal-content :deep(p),
.modal-content :deep(ul) {
  margin-bottom: var(--space-4);
  line-height: 1.6;
}

.modal-footer {
  padding: var(--space-4);
  border-top: 1px solid var(--color-gray-200);
  text-align: right;
}

.button-primary {
  padding: var(--space-3) var(--space-6);
  background-color: var(--color-blue);
  color: var(--color-white);
  border: none;
  border-radius: var(--radius-button);
  cursor: pointer;
}
</style> 