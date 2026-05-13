<template>
  <div class="chart-card">
    <div class="chart-card__header">
      <span class="chart-card__title">Avg Speed</span>
      <span class="chart-card__unit">km/h · fleet-wide</span>
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
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import { useMetricsStore } from '../../stores/metricsStore'
import { useThrottle } from '../../composables/useThrottle'

use([CanvasRenderer, LineChart, GridComponent, TooltipComponent])

const UPDATE_OPTS = { notMerge: false, lazyUpdate: true }

const metricsStore = useMetricsStore()
const chartRef = ref<InstanceType<typeof VChart> | null>(null)

const hasSeries = computed(() => metricsStore.avgSpeedSeries.length > 0)

const option = computed(() => ({
  animation: false,
  backgroundColor: 'transparent',
  grid: { top: 8, right: 12, bottom: 32, left: 44 },
  tooltip: {
    trigger: 'axis',
    backgroundColor: '#1a1d24',
    borderColor: '#2a2d35',
    textStyle: { color: '#e8e6e1', fontFamily: 'IBM Plex Mono', fontSize: 11 },
    formatter: (params: { value: [number, number] }[]) => {
      if (!params[0]) return ''
      const [ts, speed] = params[0].value
      const time = new Date(ts).toLocaleTimeString('en-GB', { hour12: false })
      return `${time}<br/><b>${speed.toFixed(1)} km/h</b>`
    },
  },
  xAxis: {
    type: 'time',
    maxInterval: 30 * 1000, // label at most every 30s
    axisLabel: {
      color: '#6b7280',
      fontFamily: 'IBM Plex Mono',
      fontSize: 10,
      hideOverlap: true,
      formatter: (val: number) => {
        const d = new Date(val)
        const hh = String(d.getHours()).padStart(2, '0')
        const mm = String(d.getMinutes()).padStart(2, '0')
        const ss = String(d.getSeconds()).padStart(2, '0')
        return `${hh}:${mm}:${ss}`
      },
    },
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
      type: 'line',
      data: metricsStore.avgSpeedSeries,
      smooth: true,
      symbol: 'none',
      lineStyle: { color: '#F59E0B', width: 2 },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(245,158,11,0.25)' },
            { offset: 1, color: 'rgba(245,158,11,0)' },
          ],
        },
      },
    },
  ],
}))

const throttledUpdate = useThrottle(() => {
  chartRef.value?.setOption(
    { series: [{ data: metricsStore.avgSpeedSeries }] },
    false
  )
}, 100)

watch(() => metricsStore.avgSpeedSeries, throttledUpdate)
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