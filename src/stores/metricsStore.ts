import { defineStore } from 'pinia'
import { shallowRef, computed } from 'vue'
import type { FleetTick, OHLCPoint } from '../types'

const MAX_SERIES = 120
const OHLC_WINDOW_MS = 30_000

export const useMetricsStore = defineStore('metrics', () => {
  const series = shallowRef<FleetTick[]>([])
  // Time range cutoff managed externally — set by uiStore watcher in App.vue
  const cutoff = shallowRef<number>(0)

  function push(tick: FleetTick) {
    const next = [...series.value, tick]
    if (next.length > MAX_SERIES) next.shift()
    series.value = next
  }

  function clear() {
    series.value = []
  }

  function setCutoff(ms: number) {
    cutoff.value = ms
  }

  const visibleSeries = computed(() => {
    if (!cutoff.value) return series.value
    return series.value.filter(t => t.timestamp >= cutoff.value)
  })

  const avgSpeedSeries = computed(() =>
    visibleSeries.value.map(t => [t.timestamp, t.speed] as [number, number])
  )

  const fuelByVehicle = computed(() => {
    const map = new Map<string, { timestamp: number; fuel: number }[]>()
    for (const t of visibleSeries.value) {
      if (!map.has(t.vehicleId)) map.set(t.vehicleId, [])
      map.get(t.vehicleId)!.push({ timestamp: t.timestamp, fuel: t.fuel })
    }
    return map
  })

  const activeVehicleCount = computed(() => {
    const threshold = Date.now() - 3000
    const seen = new Set(series.value.filter(t => t.timestamp > threshold).map(t => t.vehicleId))
    return seen.size
  })

  const avgFuelRemaining = computed(() => {
    const latest = new Map<string, number>()
    for (const t of series.value) latest.set(t.vehicleId, t.fuel)
    if (!latest.size) return 0
    return [...latest.values()].reduce((a, b) => a + b, 0) / latest.size
  })

  const ohlcSeries = computed<OHLCPoint[]>(() => {
    if (!visibleSeries.value.length) return []
    const buckets = new Map<number, number[]>()
    for (const t of visibleSeries.value) {
      const bucket = Math.floor(t.timestamp / OHLC_WINDOW_MS) * OHLC_WINDOW_MS
      if (!buckets.has(bucket)) buckets.set(bucket, [])
      buckets.get(bucket)!.push(t.speed)
    }
    return [...buckets.entries()]
      .sort(([a], [b]) => a - b)
      .map(([time, speeds]) => ({
        time,
        open: speeds[0],
        close: speeds[speeds.length - 1],
        high: Math.max(...speeds),
        low: Math.min(...speeds),
      }))
  })

  const deliveriesByRoute = computed(() => {
    const counts = new Map<string, number>()
    for (const t of visibleSeries.value) {
      if (t.status === 'moving') {
        counts.set(t.routeId, (counts.get(t.routeId) ?? 0) + 1)
      }
    }
    return [...counts.entries()].map(([route, count]) => ({ route, count }))
  })

  return {
    series,
    push,
    clear,
    setCutoff,
    visibleSeries,
    avgSpeedSeries,
    fuelByVehicle,
    activeVehicleCount,
    avgFuelRemaining,
    ohlcSeries,
    deliveriesByRoute,
  }
})