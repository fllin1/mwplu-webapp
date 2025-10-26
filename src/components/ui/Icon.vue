<template>
  <span
    class="icon"
    :style="computedStyle"
    :role="ariaRole"
    :aria-label="ariaLabel"
    :aria-hidden="ariaHidden"
  >
    <!-- Inline SVGs so no loader is required -->
    <svg v-if="iconName === 'comment'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-svg">
      <title v-if="title">{{ title }}</title>
      <path d="M21 14a4 4 0 0 1-4 4H9l-4 3v-3a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4h12a4 4 0 0 1 4 4z" />
      <path d="M7.5 10h9" />
      <path d="M7.5 13h6" />
    </svg>

    <svg v-else-if="iconName === 'download'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-svg">
      <title v-if="title">{{ title }}</title>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="M7 10l5 5 5-5" />
      <path d="M12 15V3" />
    </svg>

    <svg v-else-if="iconName === 'user'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-svg">
      <title v-if="title">{{ title }}</title>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>

    <svg v-else-if="iconName === 'robot'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-svg">
      <title v-if="title">{{ title }}</title>
      <rect x="3" y="7" width="18" height="12" rx="3" />
      <path d="M12 3v4" />
      <circle cx="8.5" cy="13" r="1" />
      <circle cx="15.5" cy="13" r="1" />
      <path d="M8 17h8" />
    </svg>

    <svg v-else-if="iconName === 'mail'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-svg">
      <title v-if="title">{{ title }}</title>
      <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
      <path d="M22 6l-10 7L2 6" />
    </svg>

    <svg v-else-if="iconName === 'star'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-svg">
      <title v-if="title">{{ title }}</title>
      <polygon points="12 2 15 9 22 9 17 14 19 21 12 17 5 21 7 14 2 9 9 9 12 2" />
    </svg>

    <svg v-else-if="iconName === 'compass'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-svg">
      <title v-if="title">{{ title }}</title>
      <circle cx="12" cy="12" r="10" />
      <polygon points="16 8 14 14 8 16 10 10 16 8" />
    </svg>

    <!-- Default fallback -->
    <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-svg">
      <title v-if="title">{{ title }}</title>
      <circle cx="12" cy="12" r="10" />
    </svg>
  </span>
  
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
  name: { type: String, required: true },
  size: { type: [String, Number], default: 'md' },
  color: { type: String, default: 'currentColor' },
  title: { type: String, default: '' },
  decorative: { type: Boolean, default: false },
})

const iconName = computed(() => props.name)

const sizeToPx = (val) => {
  if (typeof val === 'number') return `${val}px`
  if (/^\d+$/.test(val)) return `${val}px`
  if (val === 'sm') return '16px'
  if (val === 'lg') return '28px'
  return '24px'
}

const computedStyle = computed(() => ({
  width: sizeToPx(props.size),
  height: sizeToPx(props.size),
  color: props.color,
}))

const ariaRole = computed(() => (props.decorative ? undefined : 'img'))
const ariaLabel = computed(() => (props.decorative ? undefined : (props.title || props.name)))
const ariaHidden = computed(() => (props.decorative ? 'true' : undefined))
</script>

<style scoped>
.icon {
  display: inline-flex;
  line-height: 0;
  /* fallback size in case inline style not applied */
  width: 24px;
  height: 24px;
}
.icon-svg {
  width: 100%;
  height: 100%;
  display: block;
}
</style>


