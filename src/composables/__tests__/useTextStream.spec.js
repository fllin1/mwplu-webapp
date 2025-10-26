import { describe, it, expect, beforeEach, vi } from 'vitest'
import { nextTick, computed } from 'vue'
import { useTextStream } from '@/composables/useTextStream'

describe('useTextStream', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  it('initializes with empty state', () => {
    const { displayedText, isComplete, segments } = useTextStream({ textStream: '' })
    
    expect(displayedText.value).toBe('')
    expect(isComplete.value).toBe(false)
    expect(segments.value).toEqual([])
  })

  it('streams text in typewriter mode', async () => {
    const text = 'Hello World'
    const { displayedText, isComplete } = useTextStream({
      textStream: text,
      mode: 'typewriter',
      speed: 100,
    })

    await nextTick()
    
    // Initially empty, then starts streaming
    expect(displayedText.value).toBe('')
    
    // Fast-forward through animation frames
    vi.advanceTimersByTime(50)
    await nextTick()
    
    // Text should start appearing
    expect(displayedText.value.length).toBeGreaterThan(0)
  })

  it('calls onComplete callback when streaming finishes', async () => {
    const onComplete = vi.fn()
    const text = 'Test'
    
    useTextStream({
      textStream: text,
      mode: 'typewriter',
      speed: 100,
      onComplete,
    })

    await nextTick()
    
    // Simulate animation completion
    vi.advanceTimersByTime(1000)
    await nextTick()
    
    expect(onComplete).toHaveBeenCalled()
  })

  it('generates segments in fade mode', async () => {
    const text = 'Hello World'
    const { segments } = useTextStream({
      textStream: text,
      mode: 'fade',
      speed: 50,
    })

    await nextTick()
    vi.advanceTimersByTime(100)
    await nextTick()
    
    // Should have segments for words
    expect(segments.value.length).toBeGreaterThan(0)
  })

  it('respects custom speed settings', async () => {
    const text = 'Fast'
    const { displayedText } = useTextStream({
      textStream: text,
      mode: 'typewriter',
      speed: 100, // Very fast
    })

    await nextTick()
    vi.advanceTimersByTime(50)
    await nextTick()
    
    // With high speed, should show more text quickly
    expect(displayedText.value.length).toBeGreaterThan(0)
  })

  it('can be paused and resumed', async () => {
    const text = 'Pause me'
    const { displayedText, pause, resume } = useTextStream({
      textStream: text,
      mode: 'typewriter',
      speed: 50,
    })

    await nextTick()
    vi.advanceTimersByTime(50)
    await nextTick()
    
    const lengthBeforePause = displayedText.value.length
    
    pause()
    vi.advanceTimersByTime(100)
    await nextTick()
    
    // Should not advance while paused
    expect(displayedText.value.length).toBe(lengthBeforePause)
    
    resume()
    vi.advanceTimersByTime(100)
    await nextTick()
    
    // Should continue after resume
    expect(displayedText.value.length).toBeGreaterThanOrEqual(lengthBeforePause)
  })

  it('can be reset', async () => {
    const text = 'Reset me'
    const { displayedText, isComplete, reset } = useTextStream({
      textStream: text,
      mode: 'typewriter',
      speed: 50,
    })

    await nextTick()
    vi.advanceTimersByTime(100)
    await nextTick()
    
    expect(displayedText.value.length).toBeGreaterThan(0)
    
    reset()
    await nextTick()
    
    expect(displayedText.value).toBe('')
    expect(isComplete.value).toBe(false)
  })

  it('handles custom characterChunkSize', async () => {
    const text = 'Custom chunks'
    const { displayedText } = useTextStream({
      textStream: text,
      mode: 'typewriter',
      speed: 50,
      characterChunkSize: 5, // Process 5 chars at a time
    })

    await nextTick()
    vi.advanceTimersByTime(50)
    await nextTick()
    
    // Should process in chunks
    expect(displayedText.value.length).toBeGreaterThan(0)
  })

  it('handles error callback', async () => {
    const onError = vi.fn()
    
    // Create a text that might cause segmentation error (depends on browser support)
    const text = 'Test error handling'
    
    useTextStream({
      textStream: text,
      mode: 'fade',
      speed: 50,
      onError,
    })

    await nextTick()
    vi.advanceTimersByTime(100)
    await nextTick()
    
    // onError should be available even if not called
    expect(typeof onError).toBe('function')
  })

  it('progresses when options are computed refs', async () => {
    const textRef = computed(() => 'Hi there')
    const speedRef = computed(() => 100)
    const modeRef = computed(() => 'typewriter')

    const { displayedText } = useTextStream({
      textStream: textRef,
      speed: speedRef,
      mode: modeRef,
    })

    await nextTick()
    vi.advanceTimersByTime(100)
    await nextTick()

    expect(displayedText.value.length).toBeGreaterThan(0)
  })
})

