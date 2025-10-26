import { describe, it, expect, beforeEach } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import AiChatMessage from '@/components/chat/AiChatMessage.vue'
import ResponseStream from '@/components/ui/ResponseStream.vue'

describe('AiChatMessage (markdown rendering)', () => {
  beforeEach(() => {
    // Create a new Pinia instance for each test
    setActivePinia(createPinia())
  })

  const mountMsg = (message) =>
    shallowMount(AiChatMessage, {
      props: { message },
      global: { 
        plugins: [createPinia()],
        stubs: {
          ResponseStream: true, // Stub ResponseStream for unit tests
        },
      },
    })

  it('renders basic markdown (bold, list, link, code) safely', () => {
    const md = [
      '# Title',
      '',
      '**bold** and _italic_',
      '',
      '- item 1',
      '- item 2',
      '',
      '`code` and [link](https://example.com)',
    ].join('\n')

    const wrapper = mountMsg({ id: '1', role: 'assistant', message: md, created_at: new Date().toISOString() })
    const html = wrapper.find('.message-text').html()
    expect(html).toMatch(/<strong>|<em>|<ul>|<code>|<a/)
  })

  it('sanitizes HTML to prevent script injection', () => {
    const malicious = 'Hello<script>alert(1)</script><img src=x onerror=alert(2) />'
    const wrapper = mountMsg({ id: '2', role: 'assistant', message: malicious, created_at: new Date().toISOString() })
    const html = wrapper.find('.message-text').html()
    expect(html).not.toMatch(/<script>|onerror=/)
  })

  it('applies typewriter effect to newly received assistant messages', () => {
    const wrapper = shallowMount(AiChatMessage, {
      props: {
        message: {
          id: '3',
          role: 'assistant',
          message: 'New message',
          isNewlyReceived: true,
          created_at: new Date().toISOString(),
        },
      },
      global: {
        plugins: [createPinia()],
        stubs: {
          ResponseStream: false, // Don't stub for this test
        },
      },
    })

    const responseStream = wrapper.findComponent(ResponseStream)
    expect(responseStream.exists()).toBe(true)
    expect(responseStream.props('textStream')).toBe('New message')
  })

  it('uses regular display for historical assistant messages', () => {
    const wrapper = mountMsg({
      id: '4',
      role: 'assistant',
      message: '**Historical** message',
      isNewlyReceived: false,
      created_at: new Date().toISOString(),
    })

    const responseStream = wrapper.findComponent(ResponseStream)
    expect(responseStream.exists()).toBe(false)
    
    const html = wrapper.find('.message-text').html()
    expect(html).toMatch(/<strong>Historical<\/strong>/)
  })

  it('does not use streaming for user messages', () => {
    const wrapper = shallowMount(AiChatMessage, {
      props: {
        message: {
          id: '5',
          role: 'user',
          message: 'User message',
          isTemporary: false,
          created_at: new Date().toISOString(),
        },
      },
      global: {
        plugins: [createPinia()],
        stubs: {
          ResponseStream: false,
        },
      },
    })

    const responseStream = wrapper.findComponent(ResponseStream)
    expect(responseStream.exists()).toBe(false)
  })
})


