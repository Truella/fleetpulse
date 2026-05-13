<template>
  <div class="chart-card">
    <div class="chart-card__header">
      <span class="chart-card__title">Fuel Levels</span>
      <span class="chart-card__unit">% · top 3 vehicles</span>
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
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import { useMetricsStore } from '../../stores/metricsStore'
import { useThrottle } from '../../composables/useThrottle'

use([CanvasRenderer, LineChart, GridComponent, TooltipComponent, LegendComponent])

const UPDATE_OPTS = { notMerge: false, lazyUpdate: true }

const VEHICLE_COLORS = ['#F59E0B', '#60a5fa', '#a78bfa']

const metricsStore = useMetricsStore()
const chartRef = ref<InstanceType<typeof VChart> | null>(null)

// Pick top 3 vehicles by data density
const topVehicles = computed(() => {
  const map = metricsStore.fuelByVehicle
  return [...map.entries()]
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 3)
    .map(([id]) => id)
})

const hasSeries = computed(() => topVehicles.value.length > 0)

const seriesData = computed(() =>
  topVehicles.value.map((vid, i) => ({
    name: vid,
    type: 'line' as const,
    smooth: true,
    symbol: 'none',
    data: (metricsStore.fuelByVehicle.get(vid) ?? []).map(p => [p.timestamp, p.fuel]),
    lineStyle: { color: VEHICLE_COLORS[i], width: 2 },
    itemStyle: { color: VEHICLE_COLORS[i] },
  }))
)

const option = computed(() => ({
  animation: false,
  backgroundColor: 'transparent',
  grid: { top: 32, right: 12, bottom: 24, left: 44 },
  legend: {
    top: 0,
    right: 0,
    textStyle: { color: '#6b7280', fontFamily: 'IBM Plex Mono', fontSize: 10 },
    itemWidth: 12,
    itemHeight: 2,
  },
  tooltip: {
    trigger: 'axis',
    backgroundColor: '#1a1d24',
    borderColor: '#2a2d35',
    textStyle: { color: '#e8e6e1', fontFamily: 'IBM Plex Mono', fontSize: 11 },
  },
  xAxis: {
    type: 'time',
    axisLabel: {
      color: '#6b7280',
      fontFamily: 'IBM Plex Mono',
      fontSize: 10,
      formatter: (val: number) =>
        new Date(val).toLocaleTimeString('en-GB', { hour12: false }),
    },
    axisLine: { lineStyle: { color: '#2a2d35' } },
    splitLine: { show: false },
  },
  yAxis: {
    type: 'value',
    min: 0,
    max: 100,
    axisLabel: { color: '#6b7280', fontFamily: 'IBM Plex Mono', fontSize: 10 },
    axisLine: { show: false },
    splitLine: { lineStyle: { color: '#2a2d35', type: 'dashed' } },
  },
  series: seriesData.value,
}))

const throttledUpdate = useThrottle(() => {
  chartRef.value?.setOption(
    { series: seriesData.value },
    false
  )
}, 100)

watch(() => metricsStore.fuelByVehicle, throttledUpdate)
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