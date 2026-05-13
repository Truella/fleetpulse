<template>
  <div class="chart-card">
    <div class="chart-card__header">
      <span class="chart-card__title">Speed Variance</span>
      <span class="chart-card__unit">OHLC · 30s windows</span>
    </div>
    <div class="chart-card__body">
      <v-chart
        v-if="hasSeries"
        ref="chartRef"
        class="chart"
        :option="option"
        :update-options="UPDATE_OPTS"
        autoresize
      />
      <div v-else class="chart-empty">Waiting for data…</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { CandlestickChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import { useMetricsStore } from '../../stores/metricsStore'
import { useThrottle } from '../../composables/useThrottle'

use([CanvasRenderer, CandlestickChart, GridComponent, TooltipComponent])

const UPDATE_OPTS = { notMerge: false, lazyUpdate: true }

const metricsStore = useMetricsStore()
const chartRef = ref<InstanceType<typeof VChart> | null>(null)

const hasSeries = computed(() => metricsStore.ohlcSeries.length >= 2)

// ECharts candlestick expects [open, close, low, high] per point
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
      return [
        params[0].name,
        `O: ${o?.toFixed(1)}  C: ${c?.toFixed(1)}`,
        `L: ${l?.toFixed(1)}  H: ${h?.toFixed(1)}`,
      ].join('<br/>')
    },
  },
  xAxis: {
    type: 'category',
    data: timeData.value,
    axisLabel: { color: '#6b7280', fontFamily: 'IBM Plex Mono', fontSize: 10 },
    axisLine: { lineStyle: { color: '#2a2d35' } },
    splitLine: { show: false },
  },
  yAxis: {
    type: 'value',
    min: 0,
    max: 120,
    axisLabel: { color: '#6b7280', fontFamily: 'IBM Plex Mono', fontSize: 10 },
    axisLine: { show: false },
    splitLine: { lineStyle: { color: '#2a2d35', type: 'dashed' } },
  },
  series: [
    {
      type: 'candlestick',
      data: candleData.value,
      itemStyle: {
        color: '#22c55e',        // bullish (close > open)
        color0: '#ef4444',       // bearish (close < open)
        borderColor: '#22c55e',
        borderColor0: '#ef4444',
      },
    },
  ],
}))

const throttledUpdate = useThrottle(() => {
  chartRef.value?.setOption(
    {
      xAxis: { data: timeData.value },
      series: [{ data: candleData.value }],
    },
    false
  )
}, 100)

watch(() => metricsStore.ohlcSeries, throttledUpdate)
</script>

<style scoped>
.chart-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 0.875rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.chart-card__header {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.chart-card__title {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--color-text);
}

.chart-card__unit {
  font-size: 0.65rem;
  font-family: 'IBM Plex Mono', monospace;
  color: var(--color-muted);
}

.chart-card__body {
  position: relative;
  height: 240px;
}

.chart {
  width: 100%;
  height: 100%;
}

.chart-empty {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.75rem;
  color: var(--color-muted);
}

@media (min-width: 1280px) {
  .chart-card__body { height: 280px; }
}
</style>