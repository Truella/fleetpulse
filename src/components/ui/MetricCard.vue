<template>
  <div class="relative overflow-hidden rounded-md border border-[var(--color-border)]
              bg-[var(--color-surface)] px-4 pt-3.5 pb-2.5 flex flex-col gap-1
              transition-colors duration-200 hover:border-[var(--color-muted)]">

    <div class="flex items-center justify-between">
      <span class="text-[0.7rem] uppercase tracking-[0.08em] font-medium text-[var(--color-muted)]">
        {{ label }}
      </span>
      <span v-if="trend !== 0" class="text-[0.65rem] font-mono" :class="trendClass">
        {{ trend > 0 ? '▲' : '▼' }}
      </span>
    </div>

    <div
      class="text-[1.75rem] font-medium leading-none font-mono tabular-nums transition-colors duration-400"
      :style="{ color: valueColor }"
    >
      {{ displayValue }}
    </div>

    <!-- Sparkline -->
    <svg
      v-if="sparkPoints.length > 1"
      class="w-full mt-1.5 block"
      :viewBox="`0 0 ${WIDTH} ${HEIGHT}`"
      :height="HEIGHT"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient :id="`grad-${uid}`" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" :stop-color="accentColor" stop-opacity="0.3" />
          <stop offset="100%" :stop-color="accentColor" stop-opacity="0" />
        </linearGradient>
      </defs>
      <path :d="areaPath" :fill="`url(#grad-${uid})`" />
      <polyline
        :points="sparkPoints"
        fill="none"
        :stroke="accentColor"
        stroke-width="1.5"
        stroke-linejoin="round"
        stroke-linecap="round"
      />
    </svg>
    <div v-else class="w-full h-9 mt-1.5 rounded-sm bg-[var(--color-border)] opacity-30" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const WIDTH = 120
const HEIGHT = 36
let _uid = 0

const props = defineProps<{
  label: string
  value: number
  unit?: string
  decimals?: number
  variant?: 'default' | 'fuel' | 'alert'
  history: number[]
}>()

const uid = `mc-${_uid++}`

const displayValue = computed(() => {
  const v = props.value.toFixed(props.decimals ?? 0)
  return props.unit ? `${v}${props.unit}` : v
})

const trend = computed(() => {
  const h = props.history
  if (h.length < 6) return 0
  return h[h.length - 1] - h[h.length - 6]
})

const trendClass = computed(() =>
  trend.value > 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'
)

const accentColor = computed(() => {
  if (props.variant === 'fuel') {
    if (props.value < 20) return 'var(--color-danger)'
    if (props.value < 50) return 'var(--color-warning)'
    return 'var(--color-success)'
  }
  if (props.variant === 'alert') return props.value > 0 ? 'var(--color-danger)' : 'var(--color-success)'
  return 'var(--color-accent)'
})

const valueColor = computed(() =>
  props.variant === 'default' || !props.variant ? 'var(--color-text)' : accentColor.value
)

const sparkPoints = computed(() => {
  const data = props.history.slice(-20)
  if (data.length < 2) return ''
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const pad = 2
  return data.map((v, i) => {
    const x = (i / (data.length - 1)) * WIDTH
    const y = HEIGHT - pad - ((v - min) / range) * (HEIGHT - pad * 2)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')
})

const areaPath = computed(() => {
  const data = props.history.slice(-20)
  if (data.length < 2) return ''
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const pad = 2
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * WIDTH
    const y = HEIGHT - pad - ((v - min) / range) * (HEIGHT - pad * 2)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  return `M0,${HEIGHT} L${pts[0]} L${pts.join(' L')} L${WIDTH},${HEIGHT} Z`
})
</script>