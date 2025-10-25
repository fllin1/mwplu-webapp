import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { dbService } from '@/services/supabase'
import { useAuthStore } from '@/stores/auth'

export const useChatStore = defineStore('chat', () => {
  const authStore = useAuthStore()

  const isPopupOpen = ref(false)
  const isLoading = ref(false)
  const currentConversationId = ref(null)
  const currentDocumentId = ref(null)
  const messages = ref([])
  const error = ref(null)
  const isStreaming = ref(false)

  const hasMessages = computed(() => messages.value.length > 0)
  const hasConversation = computed(() => !!currentConversationId.value)

  /**
   * Initialize chat for a document
   */
  const initializeChat = async (documentId) => {
    if (!authStore.userId) {
      error.value = 'User must be authenticated'
      return { success: false, error: error.value }
    }

    try {
      currentDocumentId.value = documentId

      const convResult = await dbService.getActiveConversationId(authStore.userId, documentId)

      if (convResult.success && convResult.hasConversation) {
        currentConversationId.value = convResult.conversationId
        await loadMessages()
        return { success: true, hasExistingChat: true }
      }

      return { success: true, hasExistingChat: false }
    } catch (err) {
      console.error('Error initializing chat:', err)
      error.value = err.message
      return { success: false, error: err.message }
    }
  }

  /**
   * Load messages for the current conversation
   */
  const loadMessages = async () => {
    if (!currentConversationId.value) return

    try {
      isLoading.value = true
      const result = await dbService.getChatMessages(currentConversationId.value)

      if (result.success) {
        messages.value = result.data
      } else {
        error.value = result.error
      }
    } catch (err) {
      console.error('Error loading messages:', err)
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Create or get the active conversation
   */
  const createConversation = async () => {
    if (!authStore.userId || !currentDocumentId.value) {
      error.value = 'User and document are required'
      return { success: false, error: error.value }
    }

    try {
      const result = await dbService.getOrCreateConversation(
        authStore.userId,
        currentDocumentId.value
      )

      if (result.success) {
        currentConversationId.value = result.data.id
        return { success: true, conversationId: result.data.id }
      } else {
        error.value = result.error
        return { success: false, error: result.error }
      }
    } catch (err) {
      console.error('Error creating conversation:', err)
      error.value = err.message
      return { success: false, error: err.message }
    }
  }

  /**
   * Add a message to the chat
   */
  const addMessage = async (role, content, metadata = {}) => {
    if (!currentConversationId.value) {
      const convResult = await createConversation()
      if (!convResult.success) {
        return { success: false, error: convResult.error }
      }
    }

    try {
      const result = await dbService.saveChatMessage(
        currentConversationId.value,
        authStore.userId,
        currentDocumentId.value,
        role,
        content,
        metadata
      )

      if (result.success) {
        messages.value.push(result.data)
        return { success: true, data: result.data }
      } else {
        error.value = result.error
        return { success: false, error: result.error }
      }
    } catch (err) {
      console.error('Error adding message:', err)
      error.value = err.message
      return { success: false, error: err.message }
    }
  }

  /**
   * Persist a message without pushing it to the in-memory list.
   * Useful to replace a temporary message in place after persistence.
   */
  const saveMessageOnly = async (role, content, metadata = {}) => {
    if (!currentConversationId.value) {
      const convResult = await createConversation()
      if (!convResult.success) {
        return { success: false, error: convResult.error }
      }
    }

    try {
      const result = await dbService.saveChatMessage(
        currentConversationId.value,
        authStore.userId,
        currentDocumentId.value,
        role,
        content,
        metadata
      )

      if (result.success) {
        return { success: true, data: result.data }
      } else {
        error.value = result.error
        return { success: false, error: result.error }
      }
    } catch (err) {
      console.error('Error saving message:', err)
      error.value = err.message
      return { success: false, error: err.message }
    }
  }

  /**
   * Add a temporary message (for optimistic updates)
   */
  const addTemporaryMessage = (role, content) => {
    const tempMessage = {
      id: `temp-${Date.now()}`,
      role,
      message: content,
      created_at: new Date().toISOString(),
      isTemporary: true,
    }
    messages.value.push(tempMessage)
    return tempMessage
  }

  /**
   * Update a temporary message with the saved version
   */
  const replaceTemporaryMessage = (tempId, savedMessage) => {
    const index = messages.value.findIndex((m) => m.id === tempId)
    if (index !== -1) {
      messages.value[index] = savedMessage
    }
  }

  /**
   * Update the content of a temporary message
   */
  const updateTemporaryMessageContent = (tempId, content) => {
    const index = messages.value.findIndex((m) => m.id === tempId && m.isTemporary)
    if (index !== -1) {
      messages.value[index] = { ...messages.value[index], message: content }
    }
  }

  /**
   * Append delta text to a temporary message's content
   */
  const appendToTemporaryMessage = (tempId, delta) => {
    const index = messages.value.findIndex((m) => m.id === tempId && m.isTemporary)
    if (index !== -1) {
      const current = messages.value[index].message || ''
      messages.value[index] = { ...messages.value[index], message: current + delta }
    }
  }

  /**
   * Remove a temporary message
   */
  const removeTemporaryMessage = (tempId) => {
    const index = messages.value.findIndex((m) => m.id === tempId)
    if (index !== -1) {
      messages.value.splice(index, 1)
    }
  }

  /**
   * Open the chat popup
   */
  const openPopup = () => {
    isPopupOpen.value = true
  }

  /**
   * Close the chat popup
   */
  const closePopup = () => {
    isPopupOpen.value = false
  }

  /**
   * Toggle the chat popup
   */
  const togglePopup = () => {
    isPopupOpen.value = !isPopupOpen.value
  }

  /**
   * Clear the current chat
   */
  const clearChat = async () => {
    if (currentConversationId.value) {
      await dbService.deactivateConversation(currentConversationId.value)
    }
    messages.value = []
    currentConversationId.value = null
    isPopupOpen.value = false
    error.value = null
  }

  /**
   * Reset chat state (when navigating to different document)
   */
  const resetChat = () => {
    messages.value = []
    currentConversationId.value = null
    currentDocumentId.value = null
    isPopupOpen.value = false
    isLoading.value = false
    isStreaming.value = false
    error.value = null
  }

  /**
   * Set loading state
   */
  const setLoading = (loading) => {
    isLoading.value = loading
  }

  /**
   * Set streaming state
   */
  const setStreaming = (streaming) => {
    isStreaming.value = streaming
  }

  /**
   * Set error
   */
  const setError = (err) => {
    error.value = err
  }

  return {
    isPopupOpen,
    isLoading,
    isStreaming,
    currentConversationId,
    currentDocumentId,
    messages,
    error,
    hasMessages,
    hasConversation,
    initializeChat,
    loadMessages,
    createConversation,
    addMessage,
    addTemporaryMessage,
    replaceTemporaryMessage,
    removeTemporaryMessage,
    updateTemporaryMessageContent,
    appendToTemporaryMessage,
    saveMessageOnly,
    openPopup,
    closePopup,
    togglePopup,
    clearChat,
    resetChat,
    setLoading,
    setStreaming,
    setError,
  }
})
