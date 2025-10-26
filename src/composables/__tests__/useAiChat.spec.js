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

  it('sends one POST (non-streaming JSON) and reloads messages to include assistant', async () => {
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

    // user message persisted by frontend, assistant will be loaded via getChatMessages
    dbService.saveChatMessage.mockImplementation((conversationId, userId, documentId, role, message, metadata) =>
      Promise.resolve({ success: true, data: { id: role === 'user' ? 'm-user' : 'm-assist', role, message, metadata } })
    )

    // when loadMessages is called, simulate assistant already persisted server-side
    dbService.getChatMessages = vi.fn(async () => ({
      success: true,
      data: [
        { id: 'm-user', role: 'user', message: 'Hello', created_at: new Date().toISOString() },
        { id: 'm-assist', role: 'assistant', message: 'Hello AI', created_at: new Date().toISOString() }
      ]
    }))

    const { sendMessage } = useAiChat()
    const result = await sendMessage('Hello', 'doc-1')

    expect(result.success).toBe(true)
    expect(global.fetch).toHaveBeenCalledTimes(1)

    const userMsg = chatStore.messages.find((m) => m.id === 'm-user')
    const assistantMsg = chatStore.messages.find((m) => m.id === 'm-assist')

    expect(userMsg).toBeDefined()
    expect(assistantMsg).toBeDefined()
    expect(assistantMsg.message).toBe('Hello AI')
  })

  it('includes message_id from saved user message in webhook payload', async () => {
    const chatStore = useChatStore()

    const { dbService } = await import('@/services/supabase')
    dbService.getActiveConversationId.mockResolvedValue({ success: true, hasConversation: false, conversationId: null })
    dbService.getOrCreateConversation.mockResolvedValue({ success: true, data: { id: 'conv-1' } })
    await chatStore.initializeChat('doc-1')

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

    dbService.getChatMessages = vi.fn(async () => ({
      success: true,
      data: [
        { id: 'm-user-123', role: 'user', message: 'Hello', created_at: new Date().toISOString() },
        { id: 'm-assist-456', role: 'assistant', message: 'Hello AI', created_at: new Date().toISOString() }
      ]
    }))

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

  it('falls back to locally appending assistant when server does not persist and links reply_to_message_id', async () => {
    const chatStore = useChatStore()

    const { dbService } = await import('@/services/supabase')
    dbService.getActiveConversationId.mockResolvedValue({ success: true, hasConversation: false, conversationId: null })
    dbService.getOrCreateConversation.mockResolvedValue({ success: true, data: { id: 'conv-fallback' } })

    await chatStore.initializeChat('doc-1')

    // Webhook returns a response but no server persistence
    global.fetch = vi.fn(async () => ({
      ok: true,
      headers: new Headers({ 'Content-Type': 'application/json' }),
      json: async () => ({ response: 'AI says hello' }),
    }))

    // First save is the user message; second save should be assistant from fallback
    const saveSpy = vi.fn()
    dbService.saveChatMessage.mockImplementation((_convId, _userId, _docId, role, message) => {
      saveSpy(role, message)
      const id = role === 'user' ? 'm-user-fallback' : 'm-assist-fallback'
      return Promise.resolve({ success: true, data: { id, role, message, created_at: new Date().toISOString() } })
    })

    // Simulate that loading messages would NOT return assistant yet
    dbService.getChatMessages = vi.fn(async () => ({
      success: true,
      data: [
        { id: 'm-user-fallback', role: 'user', message: 'Hi', created_at: new Date().toISOString() },
      ],
    }))

    const { sendMessage } = useAiChat()
    const result = await sendMessage('Hi', 'doc-1')

    expect(result.success).toBe(true)

    // ensure assistant save was called with reply_to_message_id
    const roles = saveSpy.mock.calls.map((c) => c[0])
    expect(roles).toEqual(['user', 'assistant'])

    // The assistant save should be linked to the user message id
    // saveChatMessage signature: (conversationId, userId, documentId, role, message, metadata)
    const lastCall = saveSpy.mock.calls[1]
    const metadata = lastCall[5]
    expect(metadata).toBeTruthy()
    expect(metadata.reply_to_message_id).toBe('m-user-fallback')

    // UI should now include assistant message content
    const assistant = chatStore.messages.find((m) => m.role === 'assistant')
    expect(assistant).toBeTruthy()
    expect(assistant.message).toBe('AI says hello')
    expect(assistant?.metadata?.reply_to_message_id).toBe('m-user-fallback')
  })
  it('handles non-2xx error with a single POST and shows error message', async () => {
    const chatStore = useChatStore()

    const { dbService } = await import('@/services/supabase')
    dbService.getActiveConversationId.mockResolvedValue({ success: true, hasConversation: false, conversationId: null })
    dbService.getOrCreateConversation.mockResolvedValue({ success: true, data: { id: 'conv-1' } })
    await chatStore.initializeChat('doc-1')

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

    const errorMsg = chatStore.messages.find((m) => m.metadata?.isError)
    expect(errorMsg).toBeDefined()
  })
})
