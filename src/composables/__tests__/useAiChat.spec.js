import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAiChat } from '@/composables/useAiChat'
import { useChatStore } from '@/stores/chat'
import { useAuthStore } from '@/stores/auth'

vi.mock('@/services/supabase', async () => {
  const actual = await vi.importActual('@/services/supabase')
  return {
    ...actual,
    dbService: {
      getActiveConversationId: vi.fn(),
      getOrCreateConversation: vi.fn(),
      saveChatMessage: vi.fn(),
    },
  }
})

describe('useAiChat composable', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    const authStore = useAuthStore()
    // Set user object so userId computed property works
    authStore.setUser({ id: 'user-1', email: 'test@example.com' })
    vi.clearAllMocks()
  })

  it('sends one POST (non-streaming JSON) and persists one assistant message', async () => {
    const chatStore = useChatStore()

    const { dbService } = await import('@/services/supabase')
    dbService.getActiveConversationId.mockResolvedValue({ success: true, hasConversation: false, conversationId: null })
    dbService.getOrCreateConversation.mockResolvedValue({ success: true, data: { id: 'conv-1' } })
    await chatStore.initializeChat('doc-1')

    // mock fetch returning plain JSON
    global.fetch = vi.fn(async () => ({
      ok: true,
      headers: new Headers({ 'Content-Type': 'application/json' }),
      json: async () => ({ response: 'Hello AI' }),
    }))

    // mock saveChatMessage for both user and assistant messages
    dbService.saveChatMessage.mockImplementation((conversationId, userId, documentId, role, message, metadata) =>
      Promise.resolve({ success: true, data: { id: role === 'user' ? 'm-user' : 'm-assist', role, message, metadata } })
    )

    const { sendMessage } = useAiChat()
    const result = await sendMessage('Hello', 'doc-1')

    expect(result.success).toBe(true)
    expect(global.fetch).toHaveBeenCalledTimes(1)

    // Should have both user and assistant messages
    const userMsg = chatStore.messages.find((m) => m.id === 'm-user')
    const assistantMsg = chatStore.messages.find((m) => m.id === 'm-assist')
    
    expect(userMsg).toBeDefined()
    expect(assistantMsg).toBeDefined()
    expect(assistantMsg.message).toBe('Hello AI')
    
    // Assistant message should be marked as newly received
    expect(assistantMsg.isNewlyReceived).toBe(true)
  })

  it('includes message_id from saved user message in webhook payload', async () => {
    const chatStore = useChatStore()

    const { dbService } = await import('@/services/supabase')
    dbService.getActiveConversationId.mockResolvedValue({ success: true, hasConversation: false, conversationId: null })
    dbService.getOrCreateConversation.mockResolvedValue({ success: true, data: { id: 'conv-1' } })
    await chatStore.initializeChat('doc-1')

    // Capture body of fetch
    let capturedBody = null
    global.fetch = vi.fn(async (_url, init) => {
      capturedBody = JSON.parse(init.body)
      return {
        ok: true,
        headers: new Headers({ 'Content-Type': 'application/json' }),
        json: async () => ({ response: 'Hello AI' }),
      }
    })

    dbService.saveChatMessage.mockImplementation((conversationId, userId, documentId, role, message, metadata) =>
      Promise.resolve({ success: true, data: { id: role === 'user' ? 'm-user-123' : 'm-assist-456', role, message, metadata } })
    )

    const { sendMessage } = useAiChat()
    const result = await sendMessage('Hello', 'doc-1')

    expect(result.success).toBe(true)
    expect(global.fetch).toHaveBeenCalledTimes(1)
    expect(capturedBody).toBeTruthy()
    expect(capturedBody.message_id).toBe('m-user-123')
    expect(capturedBody.message).toBe('Hello')
    expect(capturedBody.document_id).toBe('doc-1')
    expect(capturedBody.conversation_id).toBe(chatStore.currentConversationId)
  })

  it('handles non-2xx error with a single POST and shows error message', async () => {
    const chatStore = useChatStore()

    const { dbService } = await import('@/services/supabase')
    dbService.getActiveConversationId.mockResolvedValue({ success: true, hasConversation: false, conversationId: null })
    dbService.getOrCreateConversation.mockResolvedValue({ success: true, data: { id: 'conv-1' } })
    await chatStore.initializeChat('doc-1')

    // mock fetch failing
    global.fetch = vi.fn(async () => ({
      ok: false,
      status: 500,
      headers: new Headers({ 'Content-Type': 'application/json' }),
      json: async () => ({ message: 'Server error' }),
    }))

    dbService.saveChatMessage.mockImplementation((conversationId, userId, documentId, role, message, metadata) =>
      Promise.resolve({ success: true, data: { id: role === 'user' ? 'm-user' : 'm-error', role, message, metadata } })
    )

    const { sendMessage } = useAiChat()
    const result = await sendMessage('Question', 'doc-1')

    expect(result.success).toBe(false)
    expect(result.error).toContain('Server error')
    expect(global.fetch).toHaveBeenCalledTimes(1)

    // Error message should be added
    const errorMsg = chatStore.messages.find((m) => m.metadata?.isError)
    expect(errorMsg).toBeDefined()
  })
})
