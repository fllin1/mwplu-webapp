<template>
  <div :class="['chat-message', `chat-message--${message.role}`]">
    <div v-if="message.role === 'assistant'" class="message-avatar">
      <div class="avatar-circle avatar-assistant">
        <MessageSquare :size="16" />
      </div>
    </div>
    
    <div class="message-content">
      <div class="message-text">
        <!-- Typewriter effect for NEW assistant messages only -->
        <ResponseStream
          v-if="message.isNewlyReceived && message.role === 'assistant' && !message.isError"
          :text-stream="message.message || ''"
          mode="typewriter"
          :speed="50"
          class="streaming-text"
          :on-complete="() => handleAnimationComplete(message.id)"
        />
        <!-- Regular display for everything else -->
        <div v-else v-html="formattedMessage"></div>
      </div>
      <div class="message-actions" v-if="!message.isTemporary && !message.isNewlyReceived">
        <button
          class="action-button"
          @click="copyMessage"
          title="Copier le message"
        >
          <Copy :size="14" />
        </button>
        <button
          v-if="message.role === 'assistant'"
          class="action-button"
          @click="regenerateMessage"
          title="Régénérer la réponse"
        >
          <RotateCcw :size="14" />
        </button>
      </div>
      <div class="message-timestamp">{{ formatTime(message.created_at) }}</div>
    </div>

    <div v-if="message.role === 'user'" class="message-avatar">
      <div class="avatar-circle avatar-user">
        <img v-if="userAvatar" :src="userAvatar" alt="User avatar" class="avatar-image" />
        <User v-else :size="16" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { MessageSquare, User, Copy, RotateCcw } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui'
import { useChatStore } from '@/stores/chat'
import ResponseStream from '@/components/ui/ResponseStream.vue'

const props = defineProps({
  message: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['regenerate'])

const authStore = useAuthStore()
const uiStore = useUIStore()
const chatStore = useChatStore()

const userAvatar = computed(() => {
  return authStore.user?.user_metadata?.avatar_url || null
})

const formattedMessage = computed(() => {
  const text = props.message.message || ''
  const html = marked.parse(text, { breaks: true })
  return DOMPurify.sanitize(html)
})

const formatTime = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'À l\'instant'
  if (minutes < 60) return `Il y a ${minutes} min`
  if (hours < 24) return `Il y a ${hours}h`
  if (days < 7) return `Il y a ${days}j`

  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
  })
}

const copyMessage = async () => {
  try {
    const textContent = props.message.message || ''
    await navigator.clipboard.writeText(textContent)
    uiStore.showNotification({
      type: 'success',
      message: 'Message copié dans le presse-papiers',
      autoDismiss: true,
      autoDismissDelay: 2000,
    })
  } catch (error) {
    uiStore.showNotification({
      type: 'error',
      message: 'Erreur lors de la copie du message',
      autoDismiss: true,
      autoDismissDelay: 3000,
    })
  }
}

const regenerateMessage = () => {
  emit('regenerate', props.message)
}

const handleAnimationComplete = (messageId) => {
  // Clear the isNewlyReceived flag after animation completes
  chatStore.clearNewlyReceivedFlag(messageId)
}
</script>

<style scoped>
.chat-message {
  display: flex;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.chat-message--user {
  justify-content: flex-end;
}

.chat-message--assistant {
  justify-content: flex-start;
}

.message-avatar {
  flex-shrink: 0;
  padding-top: var(--space-1);
}

.avatar-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.avatar-assistant {
  background-color: var(--color-black);
  color: var(--color-white);
}

.avatar-user {
  background-color: var(--color-gray-300);
  color: var(--color-white);
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.message-content {
  max-width: 70%;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-card);
  word-wrap: break-word;
  position: relative;
}

.chat-message--user .message-content {
  background-color: var(--color-black);
  color: var(--color-white);
  border-bottom-right-radius: var(--space-1);
}

.chat-message--assistant .message-content {
  background-color: var(--color-gray-100);
  color: var(--color-black);
  border-bottom-left-radius: var(--space-1);
}

.message-text {
  font-size: var(--font-size-md);
  line-height: 1.5;
  margin-bottom: var(--space-2);
}

.streaming-text {
  display: inline;
}

.message-text :deep(br) {
  display: block;
  content: '';
  margin: var(--space-1) 0;
}

.message-text :deep(code) {
  background-color: rgba(0, 0, 0, 0.05);
  padding: var(--space-1) var(--space-2);
  border-radius: 3px;
  font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
  font-size: 0.9em;
}

.chat-message--user .message-text :deep(code) {
  background-color: rgba(255, 255, 255, 0.2);
}

.message-text :deep(pre) {
  background-color: var(--color-gray-900);
  color: var(--color-gray-100);
  padding: var(--space-3);
  border-radius: var(--radius-form);
  overflow-x: auto;
  margin: var(--space-2) 0;
}

.message-text :deep(pre code) {
  background-color: transparent;
  padding: 0;
  color: inherit;
}

.message-actions {
  display: flex;
  gap: var(--space-1);
  margin-bottom: var(--space-2);
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.message-content:hover .message-actions {
  opacity: 1;
}

.action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-1);
  background-color: transparent;
  border: none;
  border-radius: var(--radius-button);
  cursor: pointer;
  transition: all var(--transition-fast);
  color: currentColor;
  opacity: 0.6;
}

.action-button:hover {
  opacity: 1;
  background-color: rgba(0, 0, 0, 0.05);
}

.chat-message--user .action-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.message-timestamp {
  font-size: var(--font-size-xs);
  opacity: 0.7;
  text-align: right;
}

.chat-message--user .message-timestamp {
  color: var(--color-gray-300);
}

.chat-message--assistant .message-timestamp {
  color: var(--color-gray-600);
}

@media (max-width: 768px) {
  .avatar-circle {
    width: 28px;
    height: 28px;
  }

  .message-content {
    max-width: 75%;
  }

  .message-text {
    font-size: var(--font-size-sm);
  }

  .message-actions {
    opacity: 1;
  }
}
</style>
