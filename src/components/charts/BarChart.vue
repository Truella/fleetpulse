<template>
  <div class="flex flex-col gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
    <div class="flex items-baseline gap-2">
      <span class="text-[0.75rem] font-semibold uppercase tracking-[0.07em] text-[var(--color-text)]">Deliveries per Route</span>
      <span class="text-[0.65rem] font-mono text-[var(--color-muted)]">last hour · moving ticks</span>
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
import { BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import { useMetricsStore } from '../../stores/metricsStore'

use([CanvasRenderer, BarChart, GridComponent, TooltipComponent])

const UPDATE_OPTS = { notMerge: false, lazyUpdate: true }
const metricsStore = useMetricsStore()

const sortedRoutes = computed(() =>
  [...metricsStore.deliveriesByRoute].sort((a, b) => b.count - a.count)
)

const hasSeries = computed(() => sortedRoutes.value.length > 0)

const option = computed(() => ({
  animation: false,
  backgroundColor: 'transparent',
  grid: { top: 8, right: 24, bottom: 8, left: 8, outerBounds: true },
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'none' },
    backgroundColor: '#1a1d24',
    borderColor: '#2a2d35',
    textStyle: { color: '#e8e6e1', fontFamily: 'IBM Plex Mono', fontSize: 11 },
    formatter: (params: { name: string; value: number }[]) =>
      params[0] ? `${params[0].name}<br/><b>${params[0].value} ticks</b>` : '',
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
    axisLabel: { color: '#6b7280', fontFamily: 'IBM Plex Mono', fontSize: 9 },
    axisLine: { lineStyle: { color: '#2a2d35' } },
    splitLine: { show: false },
  },
  series: [{
    type: 'bar',
    data: sortedRoutes.value.map(r => r.count),
    barMaxWidth: 16,
    itemStyle: { color: '#F59E0B', borderRadius: [0, 3, 3, 0] },
    emphasis: { itemStyle: { color: '#fbbf24' } },
  }],
}))
</script>