import { onMounted, onUnmounted } from "vue";
import { useMetricsStore } from "../stores/metricsStore";
import { useFeedStore } from "../stores/feedStore";
import { useUiStore } from "../stores/uiStore";
import { generateTick, generateFeedEntry } from "../utils/generators";
import { safeParseTick } from "../utils/validators";

const TICK_INTERVAL_MS = 500;
// Feed entries fire less frequently than ticks
const FEED_EVERY_N_TICKS = 3;

export function useDataStream() {
	const metricsStore = useMetricsStore();
	const feedStore = useFeedStore();
	const uiStore = useUiStore();

	let intervalId: ReturnType<typeof setInterval> | null = null;
	let tickCount = 0;

	function tick() {
		if (uiStore.isPaused) return;

		// Generate + validate tick
		const raw = generateTick();
		const validated = safeParseTick(raw);
		if (!validated) return;

		metricsStore.push(validated);

		// Push a feed entry every N ticks
		tickCount++;
		if (tickCount % FEED_EVERY_N_TICKS === 0) {
			feedStore.push(generateFeedEntry(validated.vehicleId));
		}
	}

	function start() {
		if (intervalId !== null) return;
		intervalId = setInterval(tick, TICK_INTERVAL_MS);
	}

	function stop() {
		if (intervalId === null) return;
		clearInterval(intervalId);
		intervalId = null;
	}

	onMounted(() => {
		uiStore.applyTheme();
		start();
	});

	onUnmounted(() => {
		stop();
	});

	return { start, stop };
}
