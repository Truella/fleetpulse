import { defineStore } from "pinia";
import { shallowRef, computed } from "vue";
import type { FleetTick, OHLCPoint } from "../types";
import { useUiStore } from "./uiStore";

const MAX_SERIES = 120;
const OHLC_WINDOW_MS = 30_000;

export const useMetricsStore = defineStore("metrics", () => {
	const series = shallowRef<FleetTick[]>([]);

	function push(tick: FleetTick) {
		const next = [...series.value, tick];
		if (next.length > MAX_SERIES) next.shift();
		series.value = next;
	}

	function clear() {
		series.value = [];
	}

	// Slice series by the ui time range cutoff
	const visibleSeries = computed(() => {
		const uiStore = useUiStore();
		const cutoff = uiStore.timeRangeCutoff;
		if (!cutoff) return series.value;
		return series.value.filter((t) => t.timestamp >= cutoff);
	});

	// Fleet-wide avg speed over time (area chart)
	const avgSpeedSeries = computed(() =>
		visibleSeries.value.map((t) => [t.timestamp, t.speed] as [number, number]),
	);

	// Per-vehicle fuel levels (line chart)
	const fuelByVehicle = computed(() => {
		const map = new Map<string, { timestamp: number; fuel: number }[]>();
		for (const t of visibleSeries.value) {
			if (!map.has(t.vehicleId)) map.set(t.vehicleId, []);
			map.get(t.vehicleId)!.push({ timestamp: t.timestamp, fuel: t.fuel });
		}
		return map;
	});

	// Active vehicle count (last 3s)
	const activeVehicleCount = computed(() => {
		const cutoff = Date.now() - 3000;
		const seen = new Set(
			series.value.filter((t) => t.timestamp > cutoff).map((t) => t.vehicleId),
		);
		return seen.size;
	});

	// Avg fuel across all vehicles (last reading per vehicle)
	const avgFuelRemaining = computed(() => {
		const latest = new Map<string, number>();
		for (const t of series.value) latest.set(t.vehicleId, t.fuel);
		if (!latest.size) return 0;
		return [...latest.values()].reduce((a, b) => a + b, 0) / latest.size;
	});

	// OHLC candles (candlestick chart)
	const ohlcSeries = computed<OHLCPoint[]>(() => {
		if (!visibleSeries.value.length) return [];
		const buckets = new Map<number, number[]>();
		for (const t of visibleSeries.value) {
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

	// Deliveries per route (bar chart)
	const deliveriesByRoute = computed(() => {
		const counts = new Map<string, number>();
		for (const t of visibleSeries.value) {
			if (t.status === "moving") {
				counts.set(t.routeId, (counts.get(t.routeId) ?? 0) + 1);
			}
		}
		return [...counts.entries()].map(([route, count]) => ({ route, count }));
	});

	return {
		series,
		push,
		clear,
		visibleSeries,
		avgSpeedSeries,
		fuelByVehicle,
		activeVehicleCount,
		avgFuelRemaining,
		ohlcSeries,
		deliveriesByRoute,
	};
});
