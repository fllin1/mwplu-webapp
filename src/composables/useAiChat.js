import { ref } from 'vue'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import { useChatStore } from '@/stores/chat'

export function useAiChat() {
  const isLoading = ref(false)
  const error = ref(null)
  const authStore = useAuthStore()
  const chatStore = useChatStore()

  const sendMessage = async (message, documentId) => {
    if (!message || !message.trim()) {
      error.value = 'Le message ne peut pas être vide'
      return { success: false, error: error.value }
    }

    if (!documentId) {
      error.value = 'ID du document manquant'
      return { success: false, error: error.value }
    }

    if (!authStore.userId) {
      error.value = 'Utilisateur non authentifié'
      return { success: false, error: error.value }
    }

    isLoading.value = true
    chatStore.setLoading(true)
    error.value = null

    try {
      const userMessage = message.trim()

      const userMessageResult = await chatStore.addMessage('user', userMessage)

      if (!userMessageResult.success) {
        throw new Error(userMessageResult.error)
      }

      chatStore.openPopup()

      // Single-path webhook call via fetch; support streaming or JSON
      const webhookUrl = 'https://n8n.automationdfy.com/webhook/mwplu/chat'
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          document_id: documentId,
          user_id: authStore.userId,
          conversation_id: chatStore.currentConversationId,
        }),
      })

      // Handle non-2xx without issuing another POST
      if (!res.ok) {
        let serverMessage = ''
        try {
          const contentType = res.headers.get('content-type') || ''
          if (contentType.includes('application/json')) {
            const body = await res.json()
            serverMessage = body?.message || JSON.stringify(body)
          } else {
            serverMessage = await res.text()
          }
        } catch (_) {
          serverMessage = 'Erreur serveur'
        }
        throw new Error(serverMessage || `HTTP ${res.status}`)
      }

      const contentType = (res.headers.get('content-type') || '').toLowerCase()
      const isStream = !!res.body && (contentType.includes('text/event-stream') || contentType.includes('application/x-ndjson'))

      if (isStream) {
        chatStore.setStreaming(true)
        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        let fullText = ''
        let temp = null

        while (true) {
          const { value, done } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })

          let idx
          while ((idx = buffer.indexOf('\n')) >= 0) {
            const line = buffer.slice(0, idx).trim()
            buffer = buffer.slice(idx + 1)
            if (!line) continue
            try {
              const evt = JSON.parse(line)
              if (evt.type === 'item' && evt.content) {
                const delta = String(evt.content)
                if (!delta) break
                if (!temp) {
                  fullText = delta
                  temp = chatStore.addTemporaryMessage('assistant', fullText)
                } else {
                  fullText += delta
                  chatStore.updateTemporaryMessageContent(temp.id, fullText)
                }
              }
            } catch (_) {
              // ignore malformed line
            }
          }
        }

        chatStore.setStreaming(false)
        if (fullText && temp) {
          const assistantMessageResult = await chatStore.saveMessageOnly('assistant', fullText)
          if (assistantMessageResult.success) {
            chatStore.replaceTemporaryMessage(temp.id, assistantMessageResult.data)
          } else {
            chatStore.removeTemporaryMessage(temp.id)
            throw new Error(assistantMessageResult.error)
          }
        }

        isLoading.value = false
        chatStore.setLoading(false)
        return { success: true, data: { response: fullText } }
      }

      // Non-streaming JSON
      const data = await res.json().catch(() => ({}))
      const aiResponse = data?.response || data?.message || ''
      if (aiResponse) {
        const assistantMessageResult = await chatStore.addMessage('assistant', aiResponse, { webhook_response: data })
        if (!assistantMessageResult.success) {
          throw new Error(assistantMessageResult.error)
        }
      }

      isLoading.value = false
      chatStore.setLoading(false)
      return { success: true, data }
    } catch (err) {
      console.error('Error sending message to webhook:', err)
      error.value = err.response?.data?.message || err.message || 'Erreur lors de l\'envoi du message'

      await chatStore.addMessage('assistant', `Désolé, une erreur s'est produite : ${error.value}`, {
        isError: true,
      })

      isLoading.value = false
      chatStore.setLoading(false)
      return { success: false, error: error.value }
    }
  }

  return {
    isLoading,
    error,
    sendMessage,
  }
}
