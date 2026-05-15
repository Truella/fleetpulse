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
      <div v-else class="absolute inset-0 flex items-center justify-center font-mono text-[0.75rem] text-[var(--color-muted)]">Waiting for data…</div>
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
    maxInterval: 30 * 1000,
    axisLabel: {
      color: '#6b7280',
      fontFamily: 'IBM Plex Mono',
      fontSize: 10,
      hideOverlap: true,
      formatter: (val: number) => {
        const d = new Date(val)
        return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}`
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
  series: [{
    type: 'line',
    data: metricsStore.avgSpeedSeries,
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