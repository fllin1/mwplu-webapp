import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { shallowMount } from '@vue/test-utils'
import AiChatWidget from '@/components/chat/AiChatWidget.vue'
import { useAuthStore } from '@/stores/auth'
import { useChatStore } from '@/stores/chat'
import { nextTick } from 'vue'

describe('AiChatWidget', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    const auth = useAuthStore()
    auth.setUser({ id: 'user-1', email: 'test@example.com', user_metadata: {} })
    auth.setSession({ access_token: 'token' })
  })

  it('renders overlay only when popup is open and closes on overlay click', async () => {
    const chatStore = useChatStore()
    chatStore.isPopupOpen = false

    const wrapper = shallowMount(AiChatWidget, {
      props: { documentId: 'doc-1', documentName: 'Doc' },
      global: {
        stubs: {
          Teleport: true,
          Transition: true,
          AiChatHeader: true,
          AiChatMessage: true,
          AiChatWelcome: true,
          Card: true,
          Button: true,
          Textarea: true,
        },
      },
    })

    expect(wrapper.find('.chat-widget-overlay').exists()).toBe(false)

    // Open
    chatStore.isPopupOpen = true
    await nextTick()
    expect(wrapper.find('.chat-widget-overlay').exists()).toBe(true)

    // Click overlay closes
    await wrapper.find('.chat-widget-overlay').trigger('click')
    expect(chatStore.isPopupOpen).toBe(false)
  })
})


