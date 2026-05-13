import { useThrottleFn } from "@vueuse/core";

export function useThrottle<T extends (...args: unknown[]) => unknown>(
	fn: T,
	ms: number,
) {
	return useThrottleFn(fn, ms);
}
