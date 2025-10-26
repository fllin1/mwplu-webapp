import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('axios', () => ({ default: { post: vi.fn(() => Promise.resolve({ data: { response: 'ok' } })) } }))
vi.mock('@/services/supabase', () => {
  return {
    dbService: {
      getActiveConversationId: vi.fn(() => Promise.resolve({ success: true, hasConversation: true, conversationId: 'conv-1' })),
      getChatMessages: vi.fn(() => Promise.resolve({ success: true, data: [] })),
      saveChatMessage: vi.fn((...args) => Promise.resolve({ success: true, data: { id: 'm1', role: 'user', message: args[4] } })),
      getOrCreateConversation: vi.fn(() => Promise.resolve({ success: true, data: { id: 'conv-1' } })),
    },
  }
})

import axios from 'axios'
import { useAiChat } from '@/composables/useAiChat'
import { useAuthStore } from '@/stores/auth'
import { useChatStore } from '@/stores/chat'

describe('useAiChat composable', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.resetAllMocks()
    // Set a fake authenticated user
    const auth = useAuthStore()
    auth.setUser({ id: 'user-1', email: 'test@example.com', user_metadata: {} })
    auth.setSession({ access_token: 'x' })
  })

  it('sends one POST (non-streaming JSON) and persists one assistant message', async () => {
    const chatStore = useChatStore()
    await chatStore.initializeChat('doc-1')

    // Mock fetch returning JSON response
    const jsonBody = { response: 'Hello AI' }
    global.fetch = vi.fn(async (url, init) => ({
      ok: true,
      status: 200,
      headers: new Headers({ 'Content-Type': 'application/json' }),
      text: async () => JSON.stringify(jsonBody),
      body: null,
    }))

    // Ensure saved assistant messages keep the correct role in returned data
    const { dbService } = await import('@/services/supabase')
    dbService.saveChatMessage.mockImplementation((conversationId, userId, documentId, role, message, metadata) =>
      Promise.resolve({ success: true, data: { id: 'm-assist', role, message, metadata } }),
    )

    const { sendMessage } = useAiChat()
    await sendMessage('Hello', 'doc-1')

    // Only fetch called once; axios fallback not used
    expect(global.fetch).toHaveBeenCalledTimes(1)
    expect(axios.post).not.toHaveBeenCalled()

    // Validate payload includes conversation_id
    const [, init] = global.fetch.mock.calls[0]
    const parsed = JSON.parse(init.body)
    expect(parsed.conversation_id).toBeDefined()

    // Assistant message persisted once
    const assistantSaves = dbService.saveChatMessage.mock.calls.filter((c) => c[3] === 'assistant')
    expect(assistantSaves.length).toBe(1)
  })

  it('streams NDJSON and updates temporary message incrementally', async () => {
    const chatStore = useChatStore()
    await chatStore.initializeChat('doc-1')

    // mock fetch streaming NDJSON
    const chunks = [
      '\n',
      JSON.stringify({ type: 'begin', metadata: {} }) + '\n',
      JSON.stringify({ type: 'item', content: 'Hello ' }) + '\n',
      JSON.stringify({ type: 'item', content: 'World' }) + '\n',
      JSON.stringify({ type: 'end', metadata: {} }) + '\n',
    ]
    const encoder = new TextEncoder()
    const data = chunks.map((c) => encoder.encode(c))

    global.fetch = vi.fn(async () => ({
      ok: true,
      headers: new Headers({ 'Content-Type': 'application/x-ndjson' }),
      body: {
        getReader() {
          let i = 0
          return {
            async read() {
              if (i < data.length) {
                return { value: data[i++], done: false }
              }
              return { value: undefined, done: true }
            },
          }
        },
      },
    }))

    // mock saveChatMessage for both user and assistant messages
    const { dbService } = await import('@/services/supabase')
    dbService.saveChatMessage.mockImplementation((conversationId, userId, documentId, role, message, metadata) =>
      Promise.resolve({ success: true, data: { id: role === 'user' ? 'm-user' : 'm-final', role, message, metadata } })
    )

    const { sendMessage } = useAiChat()
    await sendMessage('Hi', 'doc-1')

    // There should be a final assistant message with combined text
    expect(chatStore.messages.find((m) => m.id === 'm-final')?.message).toBe('Hello World')
    // And there must be exactly one assistant message (no duplicates)
    const assistantMessages = chatStore.messages.filter((m) => m.role === 'assistant')
    expect(assistantMessages.length).toBe(1)

    // Only one network POST (fetch), no axios fallback
    expect(global.fetch).toHaveBeenCalledTimes(1)
    expect(axios.post).not.toHaveBeenCalled()
  })

  it('handles non-2xx error with a single POST and shows error message', async () => {
    const chatStore = useChatStore()
    await chatStore.initializeChat('doc-1')

    // Mock fetch returning 500 with JSON error body
    global.fetch = vi.fn(async () => ({
      ok: false,
      status: 500,
      headers: new Headers({ 'Content-Type': 'application/json' }),
      json: async () => ({ message: 'Server error' }),
      text: async () => 'Server error',
      body: null,
    }))

    const { dbService } = await import('@/services/supabase')
    dbService.saveChatMessage.mockImplementation((conversationId, userId, documentId, role, message, metadata) =>
      Promise.resolve({ success: true, data: { id: `m-${role}`, role, message, metadata } }),
    )

    const { sendMessage } = useAiChat()
    const result = await sendMessage('Question', 'doc-1')

    expect(result.success).toBe(false)
    expect(global.fetch).toHaveBeenCalledTimes(1)
    expect(axios.post).not.toHaveBeenCalled()

    // One assistant error message persisted
    const assistantCalls = dbService.saveChatMessage.mock.calls.filter((c) => c[3] === 'assistant')
    expect(assistantCalls.length).toBe(1)
    const saved = chatStore.messages.find((m) => m.id === 'm-assistant') || chatStore.messages.find((m) => m.role === 'assistant')
    expect(saved?.message).toMatch(/Désolé/)
  })

  it('handles NDJSON response without proper content-type header (fallback parser)', async () => {
    const chatStore = useChatStore()
    await chatStore.initializeChat('doc-1')

    // Mock fetch returning NDJSON as plain text (without application/x-ndjson header)
    const ndjsonResponse = [
      JSON.stringify({ type: 'begin', metadata: {} }),
      JSON.stringify({ type: 'item', content: 'Hello ' }),
      JSON.stringify({ type: 'item', content: 'from ' }),
      JSON.stringify({ type: 'item', content: 'NDJSON' }),
      JSON.stringify({ type: 'end', metadata: {} }),
    ].join('\n')

    global.fetch = vi.fn(async () => ({
      ok: true,
      status: 200,
      headers: new Headers({ 'Content-Type': 'application/json' }), // Wrong header, but NDJSON content
      text: async () => ndjsonResponse,
      body: null,
    }))

    const { dbService } = await import('@/services/supabase')
    dbService.saveChatMessage.mockImplementation((conversationId, userId, documentId, role, message, metadata) =>
      Promise.resolve({ success: true, data: { id: 'm-assist', role, message, metadata } }),
    )

    const { sendMessage } = useAiChat()
    await sendMessage('Test', 'doc-1')

    // Only fetch called once
    expect(global.fetch).toHaveBeenCalledTimes(1)

    // Assistant message should have combined text from all NDJSON lines
    const assistantSaves = dbService.saveChatMessage.mock.calls.filter((c) => c[3] === 'assistant')
    expect(assistantSaves.length).toBe(1)
    expect(assistantSaves[0][4]).toBe('Hello from NDJSON')
  })
})


