<template>
  <div class="flex flex-col gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
    <div class="flex items-baseline gap-2">
      <span class="text-[0.75rem] font-semibold uppercase tracking-[0.07em] text-[var(--color-text)]">Avg Speed</span>
      <span class="text-[0.65rem] font-mono text-[var(--color-muted)]">km/h · fleet-wide</span>
    </div>
    <div class="relative h-[240px] lg:h-[280px]">
      <v-chart
        v-if="hasSeries"
        class="w-full h-full"
        :option="option"
        :update-options="UPDATE_OPTS"
        autoresize
      />
      <div v-else class="absolute inset-0 flex items-center justify-center font-mono text-[0.75rem] text-[var(--color-muted)]">
        Waiting for data…
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import { useMetricsStore } from '../../stores/metricsStore'

use([CanvasRenderer, LineChart, GridComponent, TooltipComponent])

const UPDATE_OPTS = { notMerge: false, lazyUpdate: true }
const metricsStore = useMetricsStore()
const hasSeries = computed(() => metricsStore.avgSpeedSeries.length > 1)

// Format timestamp as HH:MM:SS for category axis
const timeLabels = computed(() =>
  metricsStore.avgSpeedSeries.map(([ts]) =>
    new Date(ts).toLocaleTimeString('en-GB', { hour12: false })
  )
)

const speedValues = computed(() =>
  metricsStore.avgSpeedSeries.map(([, speed]) => speed)
)

const option = computed(() => ({
  animation: false,
  backgroundColor: 'transparent',
  grid: { top: 8, right: 12, bottom: 32, left: 44 },
  tooltip: {
    trigger: 'axis',
    backgroundColor: '#1a1d24',
    borderColor: '#2a2d35',
    textStyle: { color: '#e8e6e1', fontFamily: 'IBM Plex Mono', fontSize: 11 },
    formatter: (params: { dataIndex: number; value: number }[]) => {
      if (!params[0]) return ''
      const label = timeLabels.value[params[0].dataIndex] ?? ''
      return `${label}<br/><b>${params[0].value.toFixed(1)} km/h</b>`
    },
  },
  xAxis: {
    type: 'category',
    data: timeLabels.value,
    boundaryGap: false,
    axisLabel: {
      color: '#6b7280',
      fontFamily: 'IBM Plex Mono',
      fontSize: 10,
      hideOverlap: true,
      interval: 'auto',
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
  series: [{
    type: 'line',
    data: speedValues.value,
    smooth: true,
    symbol: 'none',
    lineStyle: { color: '#F59E0B', width: 2 },
    areaStyle: {
      color: {
        type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
        colorStops: [
          { offset: 0, color: 'rgba(245,158,11,0.25)' },
          { offset: 1, color: 'rgba(245,158,11,0)' },
        ],
      },
    },
  }],
}))
</script>