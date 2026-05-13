import { z } from "zod";
import type { FleetTick } from "../types";

export const FleetTickSchema = z.object({
	timestamp: z.number().int().positive(),
	vehicleId: z.string().min(1),
	speed: z.number().min(0).max(120),
	fuel: z.number().min(0).max(100),
	cargoLoad: z.number().min(0).max(100),
	routeId: z.string().min(1),
	status: z.enum(["moving", "stopped", "idle", "alert"]),
});

export function safeParseTick(raw: unknown): FleetTick | null {
	const result = FleetTickSchema.safeParse(raw);
	if (!result.success) {
		console.warn(
			"[FleetPulse] Malformed tick discarded:",
			result.error.flatten(),
		);
		return null;
	}
	return result.data;
}

// Dev-only: window.__injectBadTick() to test resilience
if (import.meta.env.DEV) {
	(window as unknown as Record<string, unknown>).__injectBadTick = () => {
		const bad = { timestamp: "not-a-number", vehicleId: "", speed: 9999 };
		const result = safeParseTick(bad);
		console.log(
			"[FleetPulse] Bad tick injected. Result (should be null):",
			result,
		);
		return result;
	};
}
