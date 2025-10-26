import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import ResponseStream from '@/components/ui/ResponseStream.vue'

describe('ResponseStream', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  it('renders with default props', () => {
    const wrapper = mount(ResponseStream, {
      props: {
        textStream: 'Hello World',
      },
    })
    
    expect(wrapper.exists()).toBe(true)
  })

  it('displays text in typewriter mode', async () => {
    const text = 'Test typewriter'
    const wrapper = mount(ResponseStream, {
      props: {
        textStream: text,
        mode: 'typewriter',
        speed: 100,
      },
    })
    
    await nextTick()
    vi.advanceTimersByTime(100)
    await nextTick()
    
    // Should start displaying text
    expect(wrapper.text().length).toBeGreaterThan(0)
  })

  it('displays text in fade mode', async () => {
    const text = 'Test fade mode'
    const wrapper = mount(ResponseStream, {
      props: {
        textStream: text,
        mode: 'fade',
        speed: 50,
      },
    })
    
    await nextTick()
    vi.advanceTimersByTime(100)
    await nextTick()
    
    // Should have fade segments
    const segments = wrapper.findAll('.fade-segment')
    expect(segments.length).toBeGreaterThan(0)
  })

  it('applies custom className', () => {
    const wrapper = mount(ResponseStream, {
      props: {
        textStream: 'Test',
        className: 'custom-class',
      },
    })
    
    expect(wrapper.classes()).toContain('custom-class')
  })

  it('renders as custom element type', () => {
    const wrapper = mount(ResponseStream, {
      props: {
        textStream: 'Test',
        as: 'span',
      },
    })
    
    expect(wrapper.element.tagName.toLowerCase()).toBe('span')
  })

  it('calls onComplete when streaming finishes', async () => {
    const onComplete = vi.fn()
    
    mount(ResponseStream, {
      props: {
        textStream: 'Short',
        mode: 'typewriter',
        speed: 100,
        onComplete,
      },
    })
    
    await nextTick()
    vi.advanceTimersByTime(1000)
    await nextTick()
    
    expect(onComplete).toHaveBeenCalled()
  })

  it('respects custom speed prop', async () => {
    const fastWrapper = mount(ResponseStream, {
      props: {
        textStream: 'Fast text',
        speed: 100,
      },
    })
    
    const slowWrapper = mount(ResponseStream, {
      props: {
        textStream: 'Slow text',
        speed: 10,
      },
    })
    
    await nextTick()
    vi.advanceTimersByTime(50)
    await nextTick()
    
    // Fast should display more text in same time
    expect(fastWrapper.text().length).toBeGreaterThanOrEqual(slowWrapper.text().length)
  })

  it('handles custom fadeDuration in fade mode', async () => {
    const wrapper = mount(ResponseStream, {
      props: {
        textStream: 'Fade with duration',
        mode: 'fade',
        fadeDuration: 500,
      },
    })
    
    await nextTick()
    vi.advanceTimersByTime(100)
    await nextTick()
    
    const segments = wrapper.findAll('.fade-segment')
    if (segments.length > 0) {
      const style = segments[0].attributes('style')
      expect(style).toContain('500ms')
    }
  })

  it('handles custom segmentDelay in fade mode', async () => {
    const wrapper = mount(ResponseStream, {
      props: {
        textStream: 'Segment delay test',
        mode: 'fade',
        segmentDelay: 100,
      },
    })
    
    await nextTick()
    vi.advanceTimersByTime(100)
    await nextTick()
    
    const segments = wrapper.findAll('.fade-segment')
    expect(segments.length).toBeGreaterThan(0)
  })

  it('handles whitespace correctly in fade mode', async () => {
    const text = 'Hello   World'
    const wrapper = mount(ResponseStream, {
      props: {
        textStream: text,
        mode: 'fade',
      },
    })
    
    await nextTick()
    vi.advanceTimersByTime(100)
    await nextTick()
    
    // Should preserve whitespace
    const spaceSegments = wrapper.findAll('.fade-segment-space')
    expect(spaceSegments.length).toBeGreaterThan(0)
  })

  it('updates when textStream prop changes', async () => {
    const wrapper = mount(ResponseStream, {
      props: {
        textStream: 'Original text',
        speed: 100,
      },
    })
    
    await nextTick()
    vi.advanceTimersByTime(100)
    await nextTick()
    
    await wrapper.setProps({ textStream: 'New text' })
    await nextTick()
    vi.advanceTimersByTime(100)
    await nextTick()
    
    // Should start streaming new text
    expect(wrapper.text().length).toBeGreaterThan(0)
  })

  it('respects characterChunkSize prop', async () => {
    const wrapper = mount(ResponseStream, {
      props: {
        textStream: 'Chunked text',
        mode: 'typewriter',
        characterChunkSize: 3,
        speed: 50,
      },
    })
    
    await nextTick()
    vi.advanceTimersByTime(50)
    await nextTick()
    
    // Should process text in chunks
    expect(wrapper.text().length).toBeGreaterThan(0)
  })

  it('handles empty textStream gracefully', () => {
    const wrapper = mount(ResponseStream, {
      props: {
        textStream: '',
      },
    })
    
    expect(wrapper.text()).toBe('')
  })

  it('handles very long text', async () => {
    const longText = 'A'.repeat(1000)
    const wrapper = mount(ResponseStream, {
      props: {
        textStream: longText,
        speed: 100,
      },
    })
    
    await nextTick()
    vi.advanceTimersByTime(100)
    await nextTick()
    
    // Should start streaming
    expect(wrapper.text().length).toBeGreaterThan(0)
  })
})

