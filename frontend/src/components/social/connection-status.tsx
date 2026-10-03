"use client";

import { WifiOff } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { selectConnectionStatus, selectIsConnectionDegraded } from "@/store/selectors/realtime-selectors";

/** Small banner while the realtime connection is down; presence shown below it may be stale. */
export function ConnectionStatus() {
	const degraded = useAppSelector(selectIsConnectionDegraded);
	const status = useAppSelector(selectConnectionStatus);
	if (!degraded) return null;

	return (
		<div
			role="status"
			className="mx-2 mb-2 flex items-center gap-2 rounded-md bg-surface-hover px-3 py-2 text-muted text-xs"
		>
			<WifiOff aria-hidden="true" className="size-4 shrink-0 text-warning" />
			{status === "reconnecting" ? "Reconnecting…" : "Offline. Friend activity is paused."}
		</div>
	);
}
