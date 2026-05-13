import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useLocalStorage } from "@vueuse/core";

export type TimeRange = "live" | "1m" | "5m" | "1h";

export const useUiStore = defineStore("ui", () => {
	const timeRange = ref<TimeRange>("live");
	const isPaused = ref(false);
	const activeVehicles = ref<string[]>([]); // empty = all vehicles
	const isDark = useLocalStorage("fleetpulse-dark", true);

	function togglePause() {
		isPaused.value = !isPaused.value;
	}

	function toggleTheme() {
		isDark.value = !isDark.value;
		applyTheme();
	}

	function applyTheme() {
		if (isDark.value) {
			document.documentElement.classList.add("dark");
			document.documentElement.classList.remove("light");
		} else {
			document.documentElement.classList.remove("dark");
			document.documentElement.classList.add("light");
		}
	}

	function setTimeRange(range: TimeRange) {
		timeRange.value = range;
	}

	// Returns the ms cutoff for the selected time range
	const timeRangeCutoff = computed(() => {
		const now = Date.now();
		switch (timeRange.value) {
			case "1m":
				return now - 60_000;
			case "5m":
				return now - 300_000;
			case "1h":
				return now - 3_600_000;
			default:
				return 0; // live = all buffered data
		}
	});

	return {
		timeRange,
		isPaused,
		activeVehicles,
		isDark,
		togglePause,
		toggleTheme,
		applyTheme,
		setTimeRange,
		timeRangeCutoff,
	};
});
