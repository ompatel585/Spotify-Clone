"use client";

import { useAppSelector } from "@/store/hooks";
import { selectConnectionStatus } from "@/store/selectors/realtime-selectors";

/** Realtime connection state. Emitting goes through `services/socket`, never through components directly. */
export function useSocket() {
	const status = useAppSelector(selectConnectionStatus);
	return { status, isConnected: status === "connected" };
}
