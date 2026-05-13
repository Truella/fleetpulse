export type Severity = "info" | "warning" | "critical";

export interface FleetTick {
	timestamp: number; // Unix ms
	vehicleId: string; // e.g. "TRK-042"
	speed: number; // km/h, 0–120
	fuel: number; // %, 0–100
	cargoLoad: number; // %, 0–100
	routeId: string; // e.g. "R-LOS-ABJ-07"
	status: "moving" | "stopped" | "idle" | "alert";
}

export interface FeedEntry {
	id: string;
	timestamp: number;
	vehicleId: string;
	event: string;
	severity: Severity;
}

export interface OHLCPoint {
	time: number;
	open: number;
	high: number;
	low: number;
	close: number;
}
