<template>
  <div class="plu-tabs">
    <nav class="tabs-nav">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="$emit('tab-change', tab.id)"
        :class="['tab-button', { 'active': activeTab === tab.id }]"
        type="button"
      >
        {{ tab.label }}
      </button>
    </nav>
  </div>
</template>

<script setup>
// Props
defineProps({
  activeTab: {
    type: String,
    required: true
  }
})

// Emits
defineEmits(['tab-change'])

// Tab definitions (without emojis for minimalist approach)
const tabs = [
  {
    id: 'synthesis',
    label: 'Synthèse'
  },
  {
    id: 'comments',
    label: 'Commentaires'
  },
  {
    id: 'sources',
    label: 'Sources'
  },
  {
    id: 'downloads',
    label: 'Téléchargements'
  }
]
</script>

<style scoped>
.plu-tabs {
  background: var(--color-white);
  border-bottom: 1px solid var(--color-gray-200);
  margin-bottom: var(--space-8);
}

.tabs-nav {
  display: flex;
  gap: 0;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.tabs-nav::-webkit-scrollbar {
  display: none;
}

.tab-button {
  flex: 1;
  min-width: 120px;
  padding: var(--space-4) var(--space-6);
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: var(--color-gray-600);
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.tab-button:hover {
  color: var(--color-black);
  background: var(--color-gray-50);
}

.tab-button.active {
  color: var(--color-black);
  border-bottom-color: var(--color-black);
  font-weight: var(--font-weight-semibold);
}

.tab-button:focus {
  outline: 2px solid var(--color-blue);
  outline-offset: -2px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .tab-button {
    min-width: 100px;
    padding: var(--space-3) var(--space-4);
    font-size: var(--font-size-sm);
  }
}
</style>
