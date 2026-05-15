<template>
  <main class="min-h-[calc(100vh-52px)] bg-[var(--color-bg)] px-5 py-4 flex flex-col gap-4
               max-w-[1600px] mx-auto">

    <!-- KPI row -->
    <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
      <MetricCard
        label="Active Vehicles"
        :value="metricsStore.activeVehicleCount"
        :history="activeVehicleHistory"
      />
      <MetricCard
        label="On-Time Delivery"
        :value="onTimeRate"
        unit="%"
        :decimals="1"
        :history="onTimeHistory"
      />
      <MetricCard
        label="Avg Fuel Remaining"
        :value="metricsStore.avgFuelRemaining"
        unit="%"
        :decimals="1"
        variant="fuel"
        :history="fuelHistory"
      />
      <MetricCard
        label="Open Alerts"
        :value="feedStore.openAlertCount"
        variant="alert"
        :history="alertHistory"
      />
    </section>

    <!-- Charts -->
    <section class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <AreaChart />
      <LineChart />
      <BarChart />
      <CandleStickChart />
    </section>

    <!-- Feed -->
    <section>
      <ActivityFeed />
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useMetricsStore } from '../../stores/metricsStore'
import { useFeedStore } from '../../stores/feedStore'
import MetricCard from '../ui/MetricCard.vue'
import AreaChart from '../charts/AreaChart.vue'
import LineChart from '../charts/LineChart.vue'
import BarChart from '../charts/BarChart.vue'
import CandleStickChart from '../charts/CandleStickChart.vue'
import ActivityFeed from '../ui/ActivityFeed.vue'

const metricsStore = useMetricsStore()
const feedStore = useFeedStore()

const MAX_HISTORY = 20
const activeVehicleHistory = ref<number[]>([])
const onTimeHistory = ref<number[]>([])
const fuelHistory = ref<number[]>([])
const alertHistory = ref<number[]>([])
const onTimeRate = ref(0)

function pushHistory(arr: { value: number[] }, val: number) {
  arr.value = [...arr.value.slice(-(MAX_HISTORY - 1)), val]
}

watch(
  () => metricsStore.series,
  () => {
    pushHistory(activeVehicleHistory, metricsStore.activeVehicleCount)
    pushHistory(fuelHistory, metricsStore.avgFuelRemaining)
    const s = metricsStore.series
    if (s.length) {
      const moving = s.filter(t => t.status === 'moving').length
      onTimeRate.value = Math.round((moving / s.length) * 100 * 10) / 10
      pushHistory(onTimeHistory, onTimeRate.value)
    }
  },
  { deep: false }
)

watch(() => feedStore.openAlertCount, val => pushHistory(alertHistory, val))
</script>