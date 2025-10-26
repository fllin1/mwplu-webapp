<template>
  <component :is="elementType" :class="className">
    <template v-if="mode === 'typewriter'">
      {{ displayedText }}
    </template>
    <template v-else-if="mode === 'fade'">
      <div class="response-stream-fade-container">
        <span
          v-for="(segment, idx) in segments"
          :key="`${segment.text}-${idx}`"
          :class="[
            'fade-segment',
            isWhitespace(segment.text) ? 'fade-segment-space' : ''
          ]"
          :style="{
            animationDelay: `${idx * getSegmentDelay()}ms`,
            animationDuration: `${getFadeDuration()}ms`
          }"
          @animationend="idx === segments.length - 1 ? handleLastSegmentAnimationEnd() : null"
        >
          {{ segment.text }}
        </span>
      </div>
    </template>
    <template v-else>
      {{ displayedText }}
    </template>
  </component>
</template>

<script setup>
import { computed, watch, ref } from 'vue'
import { useTextStream } from '@/composables/useTextStream'

const props = defineProps({
  textStream: {
    type: [String, Object],
    required: true,
  },
  mode: {
    type: String,
    default: 'typewriter',
    validator: (value) => ['typewriter', 'fade'].includes(value),
  },
  speed: {
    type: Number,
    default: 20,
  },
  className: {
    type: String,
    default: '',
  },
  onComplete: {
    type: Function,
    default: null,
  },
  as: {
    type: String,
    default: 'div',
  },
  fadeDuration: {
    type: Number,
    default: null,
  },
  segmentDelay: {
    type: Number,
    default: null,
  },
  characterChunkSize: {
    type: Number,
    default: null,
  },
})

const onCompleteRef = ref(props.onComplete)

watch(() => props.onComplete, (newVal) => {
  onCompleteRef.value = newVal
})

const {
  displayedText,
  isComplete,
  segments,
  getFadeDuration,
  getSegmentDelay,
} = useTextStream({
  textStream: computed(() => props.textStream),
  speed: computed(() => props.speed),
  mode: computed(() => props.mode),
  onComplete: computed(() => props.onComplete),
  fadeDuration: computed(() => props.fadeDuration),
  segmentDelay: computed(() => props.segmentDelay),
  characterChunkSize: computed(() => props.characterChunkSize),
})

const elementType = computed(() => props.as)

const isWhitespace = (text) => {
  return /^\s+$/.test(text)
}

const handleLastSegmentAnimationEnd = () => {
  if (onCompleteRef.value && isComplete.value) {
    onCompleteRef.value()
  }
}
</script>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.response-stream-fade-container {
  display: inline;
}

.fade-segment {
  display: inline-block;
  opacity: 0;
  animation: fadeIn ease-out forwards;
}

.fade-segment-space {
  white-space: pre;
}
</style>

