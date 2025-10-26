import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('@/services/supabase', () => {
  return {
    dbService: {
      getActiveConversationId: vi.fn(),
      getOrCreateConversation: vi.fn(),
      getChatMessages: vi.fn(),
      saveChatMessage: vi.fn(),
      deactivateConversation: vi.fn(),
    },
  }
})

import { useChatStore } from '@/stores/chat'
import { useAuthStore } from '@/stores/auth'
import { dbService } from '@/services/supabase'

describe('chat store (conversations)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    const auth = useAuthStore()
    auth.setUser({ id: 'user-1', email: 'test@example.com', user_metadata: {} })
    auth.setSession({ access_token: 'token' })
  })

  it('initializes with existing active conversation and loads messages', async () => {
    const store = useChatStore()

    dbService.getActiveConversationId.mockResolvedValue({
      success: true,
      hasConversation: true,
      conversationId: 'conv-1',
    })
    dbService.getChatMessages.mockResolvedValue({ success: true, data: [{ id: 'm1', role: 'user', message: 'hi' }] })

    const result = await store.initializeChat('doc-1')
    expect(result.success).toBe(true)
    expect(result.hasExistingChat).toBe(true)
    expect(store.currentConversationId).toBe('conv-1')
    expect(store.messages.length).toBe(1)
  })

  it('creates conversation and adds messages', async () => {
    const store = useChatStore()

    dbService.getActiveConversationId.mockResolvedValue({ success: true, hasConversation: false, conversationId: null })
    dbService.getOrCreateConversation.mockResolvedValue({ success: true, data: { id: 'conv-2' } })
    dbService.saveChatMessage.mockResolvedValue({ success: true, data: { id: 'm2', role: 'user', message: 'Hello' } })

    // initialize (no existing conversation)
    await store.initializeChat('doc-1')
    const addRes = await store.addMessage('user', 'Hello')
    expect(addRes.success).toBe(true)
    expect(store.currentConversationId).toBe('conv-2')
    expect(store.messages.some((m) => m.message === 'Hello')).toBe(true)
  })
})


describe('chat store (temporary messages)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    const auth = useAuthStore()
    auth.setUser({ id: 'user-1', email: 'test@example.com', user_metadata: {} })
    auth.setSession({ access_token: 'token' })
  })

  it('adds and replaces a temporary message', async () => {
    const store = useChatStore()
    // Mock conversation creation and save
    dbService.getOrCreateConversation.mockResolvedValue({ success: true, data: { id: 'conv-3' } })
    dbService.saveChatMessage.mockResolvedValue({ success: true, data: { id: 'm-final', role: 'assistant', message: 'Final text' } })

    // Set document and conversation
    await store.initializeChat('doc-1')

    const temp = store.addTemporaryMessage('assistant', '')
    expect(store.messages.find((m) => m.id === temp.id)).toBeTruthy()

    // Simulate append/update during streaming (method to implement later)
    // For now we directly mutate message like the future helper would
    const idx = store.messages.findIndex((m) => m.id === temp.id)
    store.messages[idx].message = 'Hello'
    expect(store.messages[idx].message).toBe('Hello')

    const saved = await store.addMessage('assistant', 'Final text')
    expect(saved.success).toBe(true)

    store.replaceTemporaryMessage(temp.id, saved.data)
    const replaced = store.messages.find((m) => m.id === 'm-final')
    expect(replaced).toBeTruthy()
    expect(replaced.message).toBe('Final text')
  })
})


describe('chat store (saveMessageOnly + replace flow)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    const auth = useAuthStore()
    auth.setUser({ id: 'user-1', email: 'test@example.com', user_metadata: {} })
    auth.setSession({ access_token: 'token' })
  })

  it('persists without pushing and replaces the temporary message in place', async () => {
    const store = useChatStore()

    // Mock conversation creation and save
    dbService.getOrCreateConversation.mockResolvedValue({ success: true, data: { id: 'conv-5' } })
    dbService.saveChatMessage.mockResolvedValue({ success: true, data: { id: 'm-saved', role: 'assistant', message: 'All good' } })

    await store.initializeChat('doc-9')

    const temp = store.addTemporaryMessage('assistant', 'A')

    // Call the new helper that should NOT push into messages
    const saved = await store.saveMessageOnly('assistant', 'All good')
    expect(saved.success).toBe(true)

    // Messages still contain only the temp at this point
    expect(store.messages.some((m) => m.id === temp.id)).toBe(true)
    expect(store.messages.some((m) => m.id === 'm-saved')).toBe(false)

    // Replace temp with saved data
    store.replaceTemporaryMessage(temp.id, saved.data)

    // Now we should have exactly one assistant message with the saved id
    const assistantMessages = store.messages.filter((m) => m.role === 'assistant')
    expect(assistantMessages.length).toBe(1)
    expect(store.messages.find((m) => m.id === 'm-saved')?.message).toBe('All good')
  })
})

