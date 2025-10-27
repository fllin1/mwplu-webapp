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

      const messageId = userMessageResult.data?.id

      chatStore.openPopup()

      // Simple JSON webhook call
      const webhookUrl = 'https://n8n.automationdfy.com/webhook/mwplu/chat'
      const requestPayload = {
        message_id: messageId,
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
        // Try to load server-persisted assistant first
        await chatStore.loadMessages()

        const assistantExists = chatStore.messages.some(
          (m) => m.role === 'assistant' && m?.metadata?.reply_to_message_id === messageId
        )

        if (assistantExists) {
          // Mark server-persisted assistant as newly received for animation
          const idx = chatStore.messages.findIndex(
            (m) => m.role === 'assistant' && m?.metadata?.reply_to_message_id === messageId
          )
          if (idx !== -1) {
            chatStore.messages[idx] = {
              ...chatStore.messages[idx],
              isNewlyReceived: true,
            }
          }
        } else {
          // Add temporary assistant for immediate UX and poll for server insert
          const temp = chatStore.addTemporaryMessage('assistant', aiResponse)

          const pollUntil = Date.now() + 3000
          let found = false
          while (Date.now() < pollUntil) {
            // eslint-disable-next-line no-await-in-loop
            await chatStore.loadMessages()
            const exists = chatStore.messages.some(
              (m) => m.role === 'assistant' && m?.metadata?.reply_to_message_id === messageId
            )
            if (exists) {
              found = true
              break
            }
            // eslint-disable-next-line no-await-in-loop
            await new Promise((resolve) => setTimeout(resolve, 350))
          }

          if (found) {
            // Remove temporary; server message is present
            chatStore.removeTemporaryMessage(temp.id)
            const idx = chatStore.messages.findIndex(
              (m) => m.role === 'assistant' && m?.metadata?.reply_to_message_id === messageId
            )
            if (idx !== -1) {
              chatStore.messages[idx] = {
                ...chatStore.messages[idx],
                isNewlyReceived: true,
              }
            }
          } else {
            // As a last resort, ask server to finalize turn idempotently via RPC
            try {
              const { dbService } = await import('@/services/supabase')
              await dbService.finalizeChatTurn({
                conversationId: chatStore.currentConversationId,
                userId: authStore.userId,
                documentId,
                userMessageId: messageId,
                aiText: aiResponse,
              })
              await chatStore.loadMessages()
              const existsAfter = chatStore.messages.some(
                (m) => m.role === 'assistant' && m?.metadata?.reply_to_message_id === messageId
              )
              if (existsAfter) {
                chatStore.removeTemporaryMessage(temp.id)
                const idx2 = chatStore.messages.findIndex(
                  (m) => m.role === 'assistant' && m?.metadata?.reply_to_message_id === messageId
                )
                if (idx2 !== -1) {
                  chatStore.messages[idx2] = {
                    ...chatStore.messages[idx2],
                    isNewlyReceived: true,
                  }
                }
              } else {
                // Could not persist server-side; show non-temporary content
                chatStore.replaceTemporaryMessage(temp.id, {
                  ...temp,
                  isTemporary: false,
                  isNewlyReceived: true,
                })
              }
            } catch (_) {
              chatStore.replaceTemporaryMessage(temp.id, {
                ...temp,
                isTemporary: false,
                isNewlyReceived: true,
              })
            }
          }
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
