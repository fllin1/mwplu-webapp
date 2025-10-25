import { describe, it, expect } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import AiChatMessage from '@/components/chat/AiChatMessage.vue'

describe('AiChatMessage (markdown rendering)', () => {
  const mountMsg = (message) =>
    shallowMount(AiChatMessage, {
      props: { message },
      global: { stubs: {} },
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
})


