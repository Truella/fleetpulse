import { useDebounceFn } from "@vueuse/core";

export function useDebounce<T extends (...args: unknown[]) => unknown>(
	fn: T,
	ms: number,
) {
	return useDebounceFn(fn, ms);
}
