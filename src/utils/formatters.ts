/**
 * Format a Unix ms timestamp as HH:MM:SS
 */
export function formatTime(ms: number): string {
	const d = new Date(ms);
	return d.toLocaleTimeString("en-GB", { hour12: false });
}

/**
 * Format a distance in kilometres
 */
export function formatKm(km: number): string {
	return `${km.toLocaleString("en-US", { maximumFractionDigits: 1 })} km`;
}

/**
 * Format a ratio (0–1) or percentage value (0–100) as "xx.x%"
 * Pass `asRatio: true` if the input is 0–1.
 */
export function formatPercent(value: number, asRatio = false): string {
	const pct = asRatio ? value * 100 : value;
	return `${pct.toFixed(1)}%`;
}

/**
 * Format km/h speed value
 */
export function formatSpeed(kmh: number): string {
	return `${Math.round(kmh)} km/h`;
}
