import { useDebounceFn } from "@vueuse/core";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useDebounce<T extends (...args: any[]) => any>(
	fn: T,
	ms: number,
) {
	return useDebounceFn(fn, ms);
}
