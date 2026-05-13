<template>
  <div class="card" :class="`card--${variant}`">
    <div class="card__header">
      <span class="card__label">{{ label }}</span>
      <span v-if="trend !== 0" class="card__trend" :class="trendClass">
        {{ trend > 0 ? '▲' : '▼' }}
      </span>
    </div>

    <div class="card__value font-mono" :style="{ color: valueColor }">
      {{ displayValue }}
    </div>

    <!-- Inline SVG sparkline -->
    <svg
      v-if="sparkPoints.length > 1"
      class="card__sparkline"
      :viewBox="`0 0 ${WIDTH} ${HEIGHT}`"
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
    <div v-else class="card__sparkline card__sparkline--empty" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const WIDTH = 120
const HEIGHT = 36
let _uidCounter = 0

const props = defineProps<{
  label: string
  value: number
  unit?: string
  decimals?: number
  variant?: 'default' | 'fuel' | 'alert'
  history: number[]
}>()

const uid = `mc-${_uidCounter++}`

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
  trend.value > 0 ? 'card__trend--up' : 'card__trend--down'
)

const accentColor = computed(() => {
  if (props.variant === 'fuel') {
    if (props.value < 20) return '#ef4444'
    if (props.value < 50) return '#F59E0B'
    return '#22c55e'
  }
  if (props.variant === 'alert') return props.value > 0 ? '#ef4444' : '#22c55e'
  return '#F59E0B'
})

const valueColor = computed(() => {
  if (props.variant === 'fuel' || props.variant === 'alert') return accentColor.value
  return 'var(--color-text)'
})

const variant = computed(() => props.variant ?? 'default')

const sparkPoints = computed(() => {
  const data = props.history.slice(-20)
  if (data.length < 2) return ''
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const pad = 2
  return data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * WIDTH
      const y = HEIGHT - pad - ((v - min) / range) * (HEIGHT - pad * 2)
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
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

<style scoped>
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 0.875rem 1rem 0.625rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  position: relative;
  overflow: hidden;
  transition: border-color 0.2s;
}

.card:hover {
  border-color: var(--color-muted);
}

.card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card__label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-muted);
  font-weight: 500;
}

.card__trend {
  font-size: 0.65rem;
  font-family: 'IBM Plex Mono', monospace;
}

.card__trend--up   { color: #22c55e; }
.card__trend--down { color: #ef4444; }

.card__value {
  font-size: 1.75rem;
  font-weight: 500;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  transition: color 0.4s ease;
}

.card__sparkline {
  width: 100%;
  height: 36px;
  margin-top: 0.375rem;
  display: block;
}

.card__sparkline--empty {
  background: var(--color-border);
  border-radius: 2px;
  opacity: 0.3;
}
</style>