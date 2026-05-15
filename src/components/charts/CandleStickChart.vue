<template>
  <div class="flex flex-col gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
    <div class="flex items-baseline gap-2">
      <span class="text-[0.75rem] font-semibold uppercase tracking-[0.07em] text-[var(--color-text)]">Speed Variance</span>
      <span class="text-[0.65rem] font-mono text-[var(--color-muted)]">OHLC · 30s windows</span>
    </div>
    <div class="relative h-[240px] lg:h-[280px]">
      <v-chart
        v-if="hasSeries"
        class="w-full h-full"
        :option="option"
        :update-options="UPDATE_OPTS"
        autoresize
      />
      <div v-else class="absolute inset-0 flex items-center justify-center font-mono text-[0.75rem] text-[var(--color-muted)]">Waiting for data…</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { CandlestickChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import { useMetricsStore } from '../../stores/metricsStore'

use([CanvasRenderer, CandlestickChart, GridComponent, TooltipComponent])

const UPDATE_OPTS = { notMerge: false, lazyUpdate: true }
const metricsStore = useMetricsStore()

const hasSeries = computed(() => metricsStore.ohlcSeries.length >= 2)

const candleData = computed(() =>
  metricsStore.ohlcSeries.map(p => [p.open, p.close, p.low, p.high])
)

const timeData = computed(() =>
  metricsStore.ohlcSeries.map(p =>
    new Date(p.time).toLocaleTimeString('en-GB', { hour12: false })
  )
)

const option = computed(() => ({
  animation: false,
  backgroundColor: 'transparent',
  grid: { top: 8, right: 12, bottom: 24, left: 44 },
  tooltip: {
    trigger: 'axis',
    backgroundColor: '#1a1d24',
    borderColor: '#2a2d35',
    textStyle: { color: '#e8e6e1', fontFamily: 'IBM Plex Mono', fontSize: 11 },
    formatter: (params: { name: string; value: number[] }[]) => {
      if (!params[0]) return ''
      const [o, c, l, h] = params[0].value
      return `${params[0].name}<br/>O: ${o?.toFixed(1)}  C: ${c?.toFixed(1)}<br/>L: ${l?.toFixed(1)}  H: ${h?.toFixed(1)}`
    },
  },
  xAxis: {
    type: 'category',
    data: timeData.value,
    axisLabel: { color: '#6b7280', fontFamily: 'IBM Plex Mono', fontSize: 10, hideOverlap: true },
    axisLine: { lineStyle: { color: '#2a2d35' } },
    splitLine: { show: false },
  },
  yAxis: {
    type: 'value', min: 0, max: 120,
    axisLabel: { color: '#6b7280', fontFamily: 'IBM Plex Mono', fontSize: 10 },
    axisLine: { show: false },
    splitLine: { lineStyle: { color: '#2a2d35', type: 'dashed' } },
  },
  series: [{
    type: 'candlestick',
    data: candleData.value,
    itemStyle: {
      color: '#22c55e',
      color0: '#ef4444',
      borderColor: '#22c55e',
      borderColor0: '#ef4444',
    },
  }],
}))
</script>