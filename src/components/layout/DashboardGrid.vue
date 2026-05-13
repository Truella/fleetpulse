<template>
  <main class="dashboard">
    <section class="dashboard__kpi">
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

    <section class="dashboard__charts">
      <AreaChart />
      <LineChart />
      <BarChart />
      <CandlestickChart />
    </section>

    <section class="dashboard__feed">
      <slot name="feed" />
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
//import BarChart from '../charts/BarChart.vue'
//import CandlestickChart from '../charts/CandlestickChart.vue'

const metricsStore = useMetricsStore()
const feedStore = useFeedStore()

const MAX_HISTORY = 20
const activeVehicleHistory = ref<number[]>([])
const onTimeHistory = ref<number[]>([])
const fuelHistory = ref<number[]>([])
const alertHistory = ref<number[]>([])
const onTimeRate = ref(0)

function pushHistory(arr: ReturnType<typeof ref<number[]>>, val: number) {
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

<style scoped>
.dashboard {
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-height: calc(100vh - 52px);
  background: var(--color-bg);
}

.dashboard__kpi {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
}

.dashboard__charts {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.dashboard__feed {
  min-height: 320px;
}

@media (max-width: 1279px) and (min-width: 768px) {
  .dashboard__kpi    { grid-template-columns: repeat(2, 1fr); }
  .dashboard__charts { grid-template-columns: 1fr; }
}

@media (max-width: 767px) {
  .dashboard         { padding: 0.75rem; }
  .dashboard__kpi    { grid-template-columns: 1fr; }
  .dashboard__charts { grid-template-columns: 1fr; }
}
</style>