<template>
  <div class="chat-welcome">
    <div class="welcome-icon">
      <Sparkles :size="48" />
    </div>

    <div class="welcome-content">
      <h2 class="welcome-title">Bonjour {{ userName }} !</h2>
      <h3 class="welcome-subtitle">Comment puis-je vous aider ?</h3>
      <p class="welcome-description">
        Je suis là pour vous aider à comprendre les règles d'urbanisme. Choisissez parmi les suggestions ci-dessous ou posez votre propre question !
      </p>
    </div>

    <div class="quick-prompts">
      <Badge
        v-for="prompt in quickPrompts"
        :key="prompt.id"
        variant="secondary"
        size="md"
        class="prompt-badge"
        @click="handlePromptClick(prompt.text)"
      >
        <component :is="prompt.icon" :size="16" />
        {{ prompt.label }}
      </Badge>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Sparkles, Ruler, Building2, MapPin, Maximize } from 'lucide-vue-next'
import Badge from '@/components/ui/Badge.vue'
import { useAuthStore } from '@/stores/auth'

const emit = defineEmits(['prompt-selected'])

const authStore = useAuthStore()

const userName = computed(() => {
  if (authStore.user?.user_metadata?.full_name) {
    return authStore.user.user_metadata.full_name.split(' ')[0]
  }
  return 'Utilisateur'
})

const quickPrompts = [
  {
    id: 'rules',
    label: 'Règles de construction',
    text: 'Quelles sont les principales règles de construction dans cette zone ?',
    icon: Building2,
  },
  {
    id: 'height',
    label: 'Limites de hauteur',
    text: 'Quelles sont les limites de hauteur pour les constructions ?',
    icon: Ruler,
  },
  {
    id: 'cos',
    label: 'Calculer le COS',
    text: 'Comment calculer le coefficient d\'occupation des sols (COS) ?',
    icon: Maximize,
  },
  {
    id: 'setback',
    label: 'Reculs obligatoires',
    text: 'Quels sont les reculs obligatoires par rapport aux limites ?',
    icon: MapPin,
  },
]

const handlePromptClick = (text) => {
  emit('prompt-selected', text)
}
</script>

<style scoped>
.chat-welcome {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-6);
  text-align: center;
  gap: var(--space-6);
}

.welcome-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, var(--color-black) 0%, var(--color-gray-700) 100%);
  border-radius: 50%;
  color: var(--color-white);
  box-shadow: var(--shadow-md);
}

.welcome-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.welcome-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-black);
  margin: 0;
}

.welcome-subtitle {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-medium);
  color: var(--color-gray-600);
  margin: 0;
}

.welcome-description {
  font-size: var(--font-size-sm);
  color: var(--color-gray-600);
  line-height: 1.5;
  max-width: 400px;
  margin: 0 auto;
}

.quick-prompts {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-2);
  width: 100%;
  max-width: 450px;
}

.prompt-badge {
  justify-content: flex-start;
  padding: var(--space-3) var(--space-4);
  transition: all var(--transition-fast);
}

.prompt-badge:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

@media (max-width: 768px) {
  .chat-welcome {
    padding: var(--space-4);
    gap: var(--space-4);
  }

  .welcome-icon {
    width: 60px;
    height: 60px;
  }

  .welcome-icon :deep(svg) {
    width: 36px;
    height: 36px;
  }

  .welcome-title {
    font-size: var(--font-size-xl);
  }

  .welcome-subtitle {
    font-size: var(--font-size-lg);
  }

  .welcome-description {
    font-size: var(--font-size-xs);
  }

  .quick-prompts {
    grid-template-columns: 1fr;
    gap: var(--space-2);
  }

  .prompt-badge {
    padding: var(--space-2) var(--space-3);
  }
}
</style>
