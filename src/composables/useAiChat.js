import { ref } from 'vue'
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

      // Simple JSON webhook call
      const webhookUrl = 'https://n8n.automationdfy.com/webhook/mwplu/chat'
      const requestPayload = {
        message: userMessage,
        document_id: documentId,
        user_id: authStore.userId,
        conversation_id: chatStore.currentConversationId,
      }

      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestPayload),
      })

      // Handle non-2xx responses
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

      // Parse JSON response
      const data = await res.json()
      console.log('Webhook response:', data)
      const aiResponse = data?.response || data?.message || ''
      console.log('Extracted AI response:', aiResponse)

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
