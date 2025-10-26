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
      const requestPayload = {
        message: userMessage,
        document_id: documentId,
        user_id: authStore.userId,
        conversation_id: chatStore.currentConversationId,
      }
      
      console.log('[WEBHOOK DEBUG] Sending request:', {
        url: webhookUrl,
        payload: requestPayload,
      })

      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestPayload),
      })

      console.log('[WEBHOOK DEBUG] Response received:', {
        ok: res.ok,
        status: res.status,
        statusText: res.statusText,
        headers: {
          contentType: res.headers.get('content-type'),
          contentLength: res.headers.get('content-length'),
        },
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

      console.log('[WEBHOOK DEBUG] Response type detection:', {
        contentType,
        hasBody: !!res.body,
        isStream,
      })

      if (isStream) {
        console.log('[WEBHOOK DEBUG] Processing as STREAMING response')
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
        console.log('[WEBHOOK DEBUG] Streaming completed:', {
          fullTextLength: fullText?.length || 0,
          hasTemp: !!temp,
        })

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
      console.log('[WEBHOOK DEBUG] Processing as NON-STREAMING JSON response')
      
      // Get raw text first to debug
      const rawText = await res.text()
      console.log('[WEBHOOK DEBUG] Raw response text:', {
        text: rawText,
        length: rawText.length,
        firstChars: rawText.substring(0, 200),
      })

      let data
      try {
        // Try parsing as regular JSON
        data = JSON.parse(rawText)
        console.log('[WEBHOOK DEBUG] Parsed JSON response:', {
          fullData: data,
          dataKeys: Object.keys(data || {}),
          hasResponse: !!data?.response,
          hasMessage: !!data?.message,
        })
      } catch (parseError) {
        console.error('[WEBHOOK DEBUG] Failed to parse as single JSON:', parseError)
        
        // Try parsing as NDJSON (multiple JSON objects separated by newlines)
        // NOTE: If webhook returns NDJSON without proper Content-Type header,
        // this fallback simulates streaming by progressively updating a temporary message.
        // For true streaming, set Content-Type: application/x-ndjson in your n8n webhook.
        try {
          console.log('[WEBHOOK DEBUG] Attempting to parse as NDJSON with simulated streaming...')
          const lines = rawText.trim().split('\n').filter(line => line.trim())
          console.log('[WEBHOOK DEBUG] Found', lines.length, 'lines')
          
          // Enable streaming mode and create temporary message
          chatStore.setStreaming(true)
          let fullText = ''
          let temp = null
          
          for (const line of lines) {
            try {
              const lineData = JSON.parse(line)
              console.log('[WEBHOOK DEBUG] Parsed NDJSON line:', lineData)
              
              // Extract content from each line
              let delta = ''
              if (lineData.type === 'item' && lineData.content) {
                delta = lineData.content
              } else if (lineData.response) {
                delta = lineData.response
              } else if (lineData.message) {
                delta = lineData.message
              }
              
              // Update temporary message progressively for streaming effect
              if (delta) {
                if (!temp) {
                  fullText = delta
                  temp = chatStore.addTemporaryMessage('assistant', fullText)
                  console.log('[WEBHOOK DEBUG] Created temporary message for streaming')
                } else {
                  fullText += delta
                  chatStore.updateTemporaryMessageContent(temp.id, fullText)
                  console.log('[WEBHOOK DEBUG] Updated temporary message, length:', fullText.length)
                }
              }
            } catch (lineError) {
              console.warn('[WEBHOOK DEBUG] Failed to parse line:', line, lineError)
            }
          }
          
          chatStore.setStreaming(false)
          
          if (fullText && temp) {
            console.log('[WEBHOOK DEBUG] NDJSON streaming completed:', {
              text: fullText,
              length: fullText.length,
            })
            
            // Save final message and replace temporary one
            const assistantMessageResult = await chatStore.saveMessageOnly('assistant', fullText)
            if (assistantMessageResult.success) {
              chatStore.replaceTemporaryMessage(temp.id, assistantMessageResult.data)
              console.log('[WEBHOOK DEBUG] Replaced temporary with saved message')
            } else {
              chatStore.removeTemporaryMessage(temp.id)
              throw new Error(assistantMessageResult.error)
            }
            
            isLoading.value = false
            chatStore.setLoading(false)
            return { success: true, data: { response: fullText } }
          } else {
            data = {}
          }
        } catch (ndjsonError) {
          console.error('[WEBHOOK DEBUG] Failed to parse as NDJSON:', ndjsonError)
          chatStore.setStreaming(false)
          data = {}
        }
      }

      const aiResponse = data?.response || data?.message || ''
      console.log('[WEBHOOK DEBUG] Extracted AI response:', {
        aiResponse,
        aiResponseLength: aiResponse?.length || 0,
        willAddMessage: !!aiResponse,
      })

      if (aiResponse) {
        const assistantMessageResult = await chatStore.addMessage('assistant', aiResponse, { webhook_response: data })
        console.log('[WEBHOOK DEBUG] Added assistant message:', {
          success: assistantMessageResult.success,
          error: assistantMessageResult.error,
          messageId: assistantMessageResult.data?.id,
        })
        if (!assistantMessageResult.success) {
          throw new Error(assistantMessageResult.error)
        }
      } else {
        console.warn('[WEBHOOK DEBUG] No AI response found in data. Response will not be displayed.')
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
