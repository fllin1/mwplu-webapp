import { ref, computed, watch, onUnmounted, getCurrentInstance, unref } from 'vue'

/**
 * Vue 3 composable for streaming text with typewriter or fade effects
 * 
 * @param {Object} options - Configuration options
 * @param {string|AsyncIterable<string>} options.textStream - Text to stream
 * @param {number} options.speed - Speed from 1-100 (default: 20)
 * @param {'typewriter'|'fade'} options.mode - Animation mode (default: 'typewriter')
 * @param {Function} options.onComplete - Callback when streaming completes
 * @param {number} options.fadeDuration - Custom fade duration in ms (overrides speed)
 * @param {number} options.segmentDelay - Custom delay between segments in ms (overrides speed)
 * @param {number} options.characterChunkSize - Custom characters per frame (overrides speed)
 * @param {Function} options.onError - Error callback
 */
export function useTextStream(options = {}) {
  const {
    textStream = '',
    speed = 20,
    mode = 'typewriter',
    onComplete = null,
    fadeDuration = null,
    segmentDelay = null,
    characterChunkSize = null,
    onError = null,
  } = options

  const displayedText = ref('')
  const isComplete = ref(false)
  const segments = ref([])

  // Internal state
  const currentIndex = ref(0)
  const animationFrameId = ref(null)
  const streamController = ref(null)
  const completedFlag = ref(false)

  // Reactive settings (unwrap options reactively)
  const speedValue = computed(() => {
    const val = unref(options.speed)
    const normalized = Math.min(100, Math.max(1, val ?? 20))
    return normalized
  })
  const modeValue = computed(() => unref(options.mode) ?? 'typewriter')
  const fadeDurationValue = computed(() => unref(options.fadeDuration))
  const segmentDelayValue = computed(() => unref(options.segmentDelay))
  const characterChunkSizeValue = computed(() => unref(options.characterChunkSize))
  const onCompleteValue = computed(() => unref(options.onComplete) || null)
  const onErrorValue = computed(() => unref(options.onError) || null)

  const getChunkSize = () => {
    if (typeof characterChunkSizeValue.value === 'number') {
      return Math.max(1, characterChunkSizeRef.value)
    }

    const normalizedSpeed = speedValue.value

    if (modeValue.value === 'typewriter') {
      if (normalizedSpeed < 25) return 1
      return Math.max(1, Math.round((normalizedSpeed - 25) / 10))
    } else if (modeRef.value === 'fade') {
      return 1
    }

    return 1
  }

  const getProcessingDelay = () => {
    if (typeof segmentDelayValue.value === 'number') {
      return Math.max(0, segmentDelayValue.value)
    }

    const normalizedSpeed = speedValue.value
    return Math.max(1, Math.round(100 / Math.sqrt(normalizedSpeed)))
  }

  const getFadeDuration = () => {
    if (typeof fadeDurationValue.value === 'number') {
      return Math.max(10, fadeDurationValue.value)
    }

    const normalizedSpeed = speedValue.value
    return Math.round(1000 / Math.sqrt(normalizedSpeed))
  }

  const getSegmentDelay = () => {
    if (typeof segmentDelayValue.value === 'number') {
      return Math.max(0, segmentDelayValue.value)
    }

    const normalizedSpeed = speedValue.value
    return Math.max(1, Math.round(100 / Math.sqrt(normalizedSpeed)))
  }

  const updateSegments = (text) => {
    if (modeValue.value === 'fade') {
      try {
        const segmenter = new Intl.Segmenter(navigator.language, {
          granularity: 'word',
        })
        const segmentIterator = segmenter.segment(text)
        const newSegments = Array.from(segmentIterator).map((segment, index) => ({
          text: segment.segment,
          index,
        }))
        segments.value = newSegments
      } catch (error) {
        // Fallback for browsers without Intl.Segmenter
        const newSegments = text
          .split(/(\s+)/)
          .filter(Boolean)
          .map((word, index) => ({
            text: word,
            index,
          }))
        segments.value = newSegments
        if (onErrorValue.value) {
          onErrorValue.value(error)
        }
      }
    }
  }

  const markComplete = () => {
    if (!completedFlag.value) {
      completedFlag.value = true
      isComplete.value = true
      if (onCompleteValue.value) {
        onCompleteValue.value()
      }
    }
  }

  const reset = () => {
    currentIndex.value = 0
    displayedText.value = ''
    segments.value = []
    isComplete.value = false
    completedFlag.value = false

    if (animationFrameId.value) {
      cancelAnimationFrame(animationFrameId.value)
      animationFrameId.value = null
    }
  }

  const processStringTypewriter = (text) => {
    let lastFrameTime = 0

    const streamContent = (timestamp) => {
      const delay = getProcessingDelay()
      if (delay > 0 && timestamp - lastFrameTime < delay) {
        animationFrameId.value = requestAnimationFrame(streamContent)
        return
      }
      lastFrameTime = timestamp

      if (currentIndex.value >= text.length) {
        markComplete()
        return
      }

      const chunkSize = getChunkSize()
      const endIndex = Math.min(currentIndex.value + chunkSize, text.length)
      const newDisplayedText = text.slice(0, endIndex)

      displayedText.value = newDisplayedText
      if (modeValue.value === 'fade') {
        updateSegments(newDisplayedText)
      }

      currentIndex.value = endIndex

      if (endIndex < text.length) {
        animationFrameId.value = requestAnimationFrame(streamContent)
      } else {
        markComplete()
      }
    }

    animationFrameId.value = requestAnimationFrame(streamContent)
  }

  const processAsyncIterable = async (stream) => {
    const controller = new AbortController()
    streamController.value = controller

    let displayed = ''

    try {
      for await (const chunk of stream) {
        if (controller.signal.aborted) return

        displayed += chunk
        displayedText.value = displayed
        updateSegments(displayed)
      }

      markComplete()
    } catch (error) {
      console.error('Error processing text stream:', error)
      markComplete()
      if (onErrorValue.value) {
        onErrorValue.value(error)
      }
    }
  }

  const startStreaming = () => {
    reset()

    // Get the actual value (unwrap if reactive)
    const actualValue = unref(textStream)

    if (typeof actualValue === 'string') {
      processStringTypewriter(actualValue)
    } else if (actualValue && typeof actualValue[Symbol.asyncIterator] === 'function') {
      processAsyncIterable(actualValue)
    }
  }

  const pause = () => {
    if (animationFrameId.value) {
      cancelAnimationFrame(animationFrameId.value)
      animationFrameId.value = null
    }
  }

  const resume = () => {
    // Get the actual value (unwrap if reactive)
    const actualValue = unref(textStream)

    if (typeof actualValue === 'string' && !isComplete.value) {
      processStringTypewriter(actualValue)
    }
  }

  // Auto-start on mount
  // Handle both plain values and reactive refs/computed
  const textStreamValue = computed(() => unref(textStream))

  watch(
    textStreamValue,
    () => {
      startStreaming()
    },
    { immediate: true }
  )

  // Cleanup on unmount (only if in component context)
  const instance = getCurrentInstance()
  if (instance) {
    onUnmounted(() => {
      if (animationFrameId.value) {
        cancelAnimationFrame(animationFrameId.value)
      }
      if (streamController.value) {
        streamController.value.abort()
      }
    })
  }

  return {
    displayedText: computed(() => displayedText.value),
    isComplete: computed(() => isComplete.value),
    segments: computed(() => segments.value),
    getFadeDuration,
    getSegmentDelay,
    reset,
    startStreaming,
    pause,
    resume,
  }
}

