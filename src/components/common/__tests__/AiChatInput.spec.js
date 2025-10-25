import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { shallowMount } from '@vue/test-utils'
import { nextTick } from 'vue'
import AiChatInput from '@/components/common/AiChatInput.vue'
import { useAuthStore } from '@/stores/auth'
import { useChatStore } from '@/stores/chat'

describe('AiChatInput', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    const auth = useAuthStore()
    auth.setUser({ id: 'user-1', email: 'test@example.com', user_metadata: {} })
    auth.setSession({ access_token: 'token' })
  })

  it('shows when popup is closed and hides when popup is open', async () => {
    const chatStore = useChatStore()
    // Prevent network or external calls during mount
    chatStore.initializeChat = vi.fn().mockResolvedValue({ success: true, hasExistingChat: false })

    const wrapper = shallowMount(AiChatInput, {
      props: { documentId: 'doc-1' },
      global: {
        stubs: {},
      },
    })

    // Initially visible (popup closed)
    expect(wrapper.find('.ai-chat-input-wrapper').exists()).toBe(true)

    // Open popup => input should hide
    chatStore.isPopupOpen = true
    await nextTick()
    expect(wrapper.find('.ai-chat-input-wrapper').exists()).toBe(false)

    // Close popup => input should show again
    chatStore.isPopupOpen = false
    await nextTick()
    expect(wrapper.find('.ai-chat-input-wrapper').exists()).toBe(true)
  })
})


