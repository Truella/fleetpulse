import { defineStore } from "pinia";
import { shallowRef, computed, ref } from "vue";
import type { FeedEntry } from "../types";

const MAX_FEED = 500;

export const useFeedStore = defineStore("feed", () => {
	const entries = shallowRef<FeedEntry[]>([]);
	const searchTerm = ref("");

	function push(entry: FeedEntry) {
		const next = [entry, ...entries.value];
		if (next.length > MAX_FEED) next.pop();
		entries.value = next;
	}

	function clear() {
		entries.value = [];
	}

	// Filtered by searchTerm — matches vehicleId or event text
	const filteredFeed = computed(() => {
		const term = searchTerm.value.trim().toLowerCase();
		if (!term) return entries.value;
		return entries.value.filter(
			(e) =>
				e.vehicleId.toLowerCase().includes(term) ||
				e.event.toLowerCase().includes(term),
		);
	});

	// Alert count (critical severity entries)
	const openAlertCount = computed(
		() => entries.value.filter((e) => e.severity === "critical").length,
	);

	return {
		entries,
		searchTerm,
		push,
		clear,
		filteredFeed,
		openAlertCount,
	};
});
