<template>
  <div class="flex flex-col gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
    <div class="flex items-baseline gap-2">
      <span class="text-[0.75rem] font-semibold uppercase tracking-[0.07em] text-[var(--color-text)]">Fuel Levels</span>
      <span class="text-[0.65rem] font-mono text-[var(--color-muted)]">% · top 3 vehicles</span>
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
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import { useMetricsStore } from '../../stores/metricsStore'

use([CanvasRenderer, LineChart, GridComponent, TooltipComponent, LegendComponent])

const UPDATE_OPTS = { notMerge: false, lazyUpdate: true }
const VEHICLE_COLORS = ['#F59E0B', '#60a5fa', '#a78bfa']
const metricsStore = useMetricsStore()

const topVehicles = computed(() =>
  [...metricsStore.fuelByVehicle.entries()]
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 3)
    .map(([id]) => id)
)

const hasSeries = computed(() => topVehicles.value.length > 0)

// Use category axis — derive shared time labels from first vehicle's data
const timeLabels = computed(() => {
  const first = topVehicles.value[0]
  if (!first) return []
  return (metricsStore.fuelByVehicle.get(first) ?? []).map(p =>
    new Date(p.timestamp).toLocaleTimeString('en-GB', { hour12: false })
  )
})

const seriesData = computed(() =>
  topVehicles.value.map((vid, i) => ({
    name: vid,
    type: 'line' as const,
    smooth: true,
    symbol: 'none',
    data: (metricsStore.fuelByVehicle.get(vid) ?? []).map(p => p.fuel),
    lineStyle: { color: VEHICLE_COLORS[i], width: 2 },
    itemStyle: { color: VEHICLE_COLORS[i] },
  }))
)

const option = computed(() => ({
  animation: false,
  backgroundColor: 'transparent',
  grid: { top: 32, right: 12, bottom: 32, left: 44 },
  legend: {
    top: 0, right: 0,
    textStyle: { color: '#6b7280', fontFamily: 'IBM Plex Mono', fontSize: 10 },
    itemWidth: 12, itemHeight: 2,
  },
  tooltip: {
    trigger: 'axis',
    backgroundColor: '#1a1d24',
    borderColor: '#2a2d35',
    textStyle: { color: '#e8e6e1', fontFamily: 'IBM Plex Mono', fontSize: 11 },
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
    type: 'value', min: 0, max: 100,
    axisLabel: { color: '#6b7280', fontFamily: 'IBM Plex Mono', fontSize: 10 },
    axisLine: { show: false },
    splitLine: { lineStyle: { color: '#2a2d35', type: 'dashed' } },
  },
  series: seriesData.value,
}))
</script>