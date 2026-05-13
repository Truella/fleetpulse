<template>
  <div class="chart-card">
    <div class="chart-card__header">
      <span class="chart-card__title">Deliveries per Route</span>
      <span class="chart-card__unit">last hour · moving ticks</span>
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
import { BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import { useMetricsStore } from '../../stores/metricsStore'
import { useDebounce } from '../../composables/useDebounce'

use([CanvasRenderer, BarChart, GridComponent, TooltipComponent])

const UPDATE_OPTS = { notMerge: false, lazyUpdate: true }

const metricsStore = useMetricsStore()
const chartRef = ref<InstanceType<typeof VChart> | null>(null)

const hasSeries = computed(() => metricsStore.deliveriesByRoute.length > 0)

const sortedRoutes = computed(() =>
  [...metricsStore.deliveriesByRoute].sort((a, b) => b.count - a.count)
)

const option = computed(() => ({
  animation: false,
  backgroundColor: 'transparent',
  grid: { top: 8, right: 24, bottom: 8, left: 8, containLabel: true },
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'none' },
    backgroundColor: '#1a1d24',
    borderColor: '#2a2d35',
    textStyle: { color: '#e8e6e1', fontFamily: 'IBM Plex Mono', fontSize: 11 },
    formatter: (params: { name: string; value: number }[]) => {
      if (!params[0]) return ''
      return `${params[0].name}<br/><b>${params[0].value} ticks</b>`
    },
  },
  xAxis: {
    type: 'value',
    axisLabel: { color: '#6b7280', fontFamily: 'IBM Plex Mono', fontSize: 10 },
    axisLine: { show: false },
    splitLine: { lineStyle: { color: '#2a2d35', type: 'dashed' } },
  },
  yAxis: {
    type: 'category',
    data: sortedRoutes.value.map(r => r.route),
    axisLabel: {
      color: '#6b7280',
      fontFamily: 'IBM Plex Mono',
      fontSize: 9,
    },
    axisLine: { lineStyle: { color: '#2a2d35' } },
    splitLine: { show: false },
  },
  series: [
    {
      type: 'bar',
      data: sortedRoutes.value.map(r => r.count),
      barMaxWidth: 16,
      itemStyle: {
        color: '#F59E0B',
        borderRadius: [0, 3, 3, 0],
      },
      emphasis: {
        itemStyle: { color: '#fbbf24' },
      },
    },
  ],
}))

// Debounced — bar chart doesn't need to update as fast as line charts
const debouncedUpdate = useDebounce(() => {
  chartRef.value?.setOption(
    {
      yAxis: { data: sortedRoutes.value.map(r => r.route) },
      series: [{ data: sortedRoutes.value.map(r => r.count) }],
    },
    false
  )
}, 300)

watch(() => metricsStore.deliveriesByRoute, debouncedUpdate)
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