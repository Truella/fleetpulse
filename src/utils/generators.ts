import type { FleetTick, FeedEntry, Severity } from "../types";

const VEHICLE_IDS = [
	"TRK-001",
	"TRK-014",
	"TRK-027",
	"TRK-042",
	"TRK-055",
	"TRK-063",
	"TRK-078",
	"TRK-091",
	"TRK-104",
	"TRK-117",
];

const ROUTE_IDS = [
	"R-LOS-ABJ-01",
	"R-LOS-ABJ-07",
	"R-KAN-LOS-03",
	"R-PHC-ABJ-02",
	"R-KAN-PHC-05",
	"R-ABJ-KAN-09",
];

const STATUSES: FleetTick["status"][] = ["moving", "stopped", "idle", "alert"];

const EVENTS = [
	"Engine check passed",
	"Fuel stop completed",
	"Cargo secured",
	"Route deviation detected",
	"Speed limit exceeded",
	"Scheduled maintenance due",
	"Delivery checkpoint reached",
	"Driver break started",
	"Driver break ended",
	"Low fuel warning",
	"Vehicle stopped unexpectedly",
	"Alert: Engine temperature high",
];

const SEVERITIES: Severity[] = [
	"info",
	"info",
	"info",
	"warning",
	"warning",
	"critical",
];

function rand(min: number, max: number): number {
	return Math.random() * (max - min) + min;
}

function randInt(min: number, max: number): number {
	return Math.floor(rand(min, max + 1));
}

function pick<T>(arr: T[]): T {
	return arr[randInt(0, arr.length - 1)];
}

let _fuelLevels: Record<string, number> = {};
let _speeds: Record<string, number> = {};

export function generateTick(): FleetTick {
	const vehicleId = pick(VEHICLE_IDS);

	// Persist fuel/speed state so values drift realistically
	if (!(_fuelLevels[vehicleId] != null)) _fuelLevels[vehicleId] = rand(30, 90);
	if (!(_speeds[vehicleId] != null)) _speeds[vehicleId] = rand(0, 100);

	_fuelLevels[vehicleId] = Math.max(
		0,
		Math.min(100, _fuelLevels[vehicleId] + rand(-1.5, 0.2)),
	);
	_speeds[vehicleId] = Math.max(
		0,
		Math.min(120, _speeds[vehicleId] + rand(-8, 8)),
	);

	const status: FleetTick["status"] =
		_speeds[vehicleId] < 2
			? "stopped"
			: _fuelLevels[vehicleId] < 15
				? "alert"
				: Math.random() < 0.05
					? "idle"
					: "moving";

	return {
		timestamp: Date.now(),
		vehicleId,
		speed: Math.round(_speeds[vehicleId] * 10) / 10,
		fuel: Math.round(_fuelLevels[vehicleId] * 10) / 10,
		cargoLoad: Math.round(rand(20, 100) * 10) / 10,
		routeId: pick(ROUTE_IDS),
		status,
	};
}

let _feedCounter = 0;

export function generateFeedEntry(vehicleId?: string): FeedEntry {
	const severity = pick(SEVERITIES);
	const vid = vehicleId ?? pick(VEHICLE_IDS);

	// Bias events toward severity
	const pool =
		severity === "critical"
			? EVENTS.filter(
					(e) =>
						e.startsWith("Alert") ||
						e.includes("warning") ||
						e.includes("exceeded"),
				)
			: severity === "warning"
				? EVENTS.filter(
						(e) =>
							e.includes("warning") ||
							e.includes("deviation") ||
							e.includes("exceeded") ||
							e.includes("due"),
					)
				: EVENTS.filter((e) => !e.startsWith("Alert"));

	return {
		id: `feed-${Date.now()}-${_feedCounter++}`,
		timestamp: Date.now(),
		vehicleId: vid,
		event: pick(pool.length ? pool : EVENTS),
		severity,
	};
}
