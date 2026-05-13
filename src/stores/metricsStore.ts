import { defineStore } from "pinia";
import { shallowRef, computed } from "vue";
import type { FleetTick, OHLCPoint } from "../types";

const MAX_SERIES = 120;
const OHLC_WINDOW_MS = 30_000;

export const useMetricsStore = defineStore("metrics", () => {
	const series = shallowRef<FleetTick[]>([]);
	const isPaused = shallowRef(false);

	function push(tick: FleetTick) {
		if (isPaused.value) return;
		const next = [...series.value, tick];
		if (next.length > MAX_SERIES) next.shift();
		series.value = next;
	}

	function clear() {
		series.value = [];
	}

	// Derived: fleet-wide average speed over time (for area chart)
	const avgSpeedSeries = computed(() =>
		series.value.map((t) => [t.timestamp, t.speed] as [number, number]),
	);

	// Derived: per-vehicle fuel levels — returns last reading per vehicle
	const fuelByVehicle = computed(() => {
		const map = new Map<string, { timestamp: number; fuel: number }[]>();
		for (const t of series.value) {
			if (!map.has(t.vehicleId)) map.set(t.vehicleId, []);
			map.get(t.vehicleId)!.push({ timestamp: t.timestamp, fuel: t.fuel });
		}
		return map;
	});

	// Derived: active vehicle count (seen in last 3 ticks worth of data)
	const activeVehicleCount = computed(() => {
		const cutoff = Date.now() - 3000;
		const seen = new Set(
			series.value.filter((t) => t.timestamp > cutoff).map((t) => t.vehicleId),
		);
		return seen.size;
	});

	// Derived: average fuel across all vehicles (last reading per vehicle)
	const avgFuelRemaining = computed(() => {
		const latest = new Map<string, number>();
		for (const t of series.value) latest.set(t.vehicleId, t.fuel);
		if (!latest.size) return 0;
		return [...latest.values()].reduce((a, b) => a + b, 0) / latest.size;
	});

	// Derived: OHLC candles bucketed into 30s windows
	const ohlcSeries = computed<OHLCPoint[]>(() => {
		if (!series.value.length) return [];

		const buckets = new Map<number, number[]>();
		for (const t of series.value) {
			const bucket = Math.floor(t.timestamp / OHLC_WINDOW_MS) * OHLC_WINDOW_MS;
			if (!buckets.has(bucket)) buckets.set(bucket, []);
			buckets.get(bucket)!.push(t.speed);
		}

		return [...buckets.entries()]
			.sort(([a], [b]) => a - b)
			.map(([time, speeds]) => ({
				time,
				open: speeds[0],
				close: speeds[speeds.length - 1],
				high: Math.max(...speeds),
				low: Math.min(...speeds),
			}));
	});

	// Derived: deliveries per route (bar chart)
	const deliveriesByRoute = computed(() => {
		const counts = new Map<string, number>();
		for (const t of series.value) {
			if (t.status === "moving") {
				counts.set(t.routeId, (counts.get(t.routeId) ?? 0) + 1);
			}
		}
		return [...counts.entries()].map(([route, count]) => ({ route, count }));
	});

	return {
		series,
		isPaused,
		push,
		clear,
		avgSpeedSeries,
		fuelByVehicle,
		activeVehicleCount,
		avgFuelRemaining,
		ohlcSeries,
		deliveriesByRoute,
	};
});
