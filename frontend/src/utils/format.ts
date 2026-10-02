const pad = (value: number) => value.toString().padStart(2, "0");

/** Seconds to `m:ss`, or `h:mm:ss` from one hour up. */
export function formatDuration(totalSeconds: number): string {
	const seconds = Math.max(0, Math.floor(totalSeconds));
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const rest = seconds % 60;
	return hours > 0 ? `${hours}:${pad(minutes)}:${pad(rest)}` : `${minutes}:${pad(rest)}`;
}

/** Seconds to a human total such as "1 hr 12 min" or "42 min". */
export function formatTotalDuration(totalSeconds: number): string {
	const minutesTotal = Math.max(0, Math.round(totalSeconds / 60));
	const hours = Math.floor(minutesTotal / 60);
	const minutes = minutesTotal % 60;
	if (hours === 0) return `${minutes} min`;
	return minutes === 0 ? `${hours} hr` : `${hours} hr ${minutes} min`;
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
	year: "numeric",
	month: "short",
	day: "numeric",
	timeZone: "UTC",
});

export function formatDate(value: string | number | Date): string {
	return dateFormatter.format(new Date(value));
}

const compactFormatter = new Intl.NumberFormat("en-US", {
	notation: "compact",
	maximumFractionDigits: 1,
});

export function formatCompactNumber(value: number): string {
	return compactFormatter.format(value);
}

const relativeFormatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

const units: readonly [Intl.RelativeTimeFormatUnit, number][] = [
	["year", 31_536_000],
	["month", 2_592_000],
	["week", 604_800],
	["day", 86_400],
	["hour", 3_600],
	["minute", 60],
];

/** "5 minutes ago", "yesterday", "just now". */
export function timeAgo(value: string | number | Date, now: number = Date.now()): string {
	const diffSeconds = Math.round((new Date(value).getTime() - now) / 1000);
	const abs = Math.abs(diffSeconds);
	if (abs < 45) return "just now";
	for (const [unit, size] of units) {
		if (abs >= size) return relativeFormatter.format(Math.round(diffSeconds / size), unit);
	}
	return relativeFormatter.format(Math.round(diffSeconds / 60), "minute");
}
