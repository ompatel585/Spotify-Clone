import type { RootState } from "@/store";
import type { ReducerState } from "@/store/root-reducer";
import type { Activity } from "@/types/contracts";

export const selectConnectionStatus = (state: RootState) => state.realtime.status;

/** True when the connection dropped (or never came up) after an attempt was made. */
export const selectIsConnectionDegraded = (state: RootState) =>
	state.realtime.attempted &&
	(state.realtime.status === "reconnecting" || state.realtime.status === "disconnected");

export const selectOnlineUserIds = (state: RootState) => state.realtime.onlineUserIds;
export const selectActivities = (state: RootState) => state.realtime.activities;

/** Usage: `useAppSelector(selectIsOnline(userId))`. */
export const selectIsOnline =
	(userId: string) =>
	(state: RootState): boolean =>
		state.realtime.onlineUserIds[userId] === true;

export const selectActivity =
	(userId: string) =>
	(state: RootState): Activity | null =>
		state.realtime.activities[userId] ?? null;

/** What this client should report as its own activity: the current song while playing, otherwise idle. */
export const selectOwnActivitySongId = (state: ReducerState): string | null =>
	state.player.isPlaying ? (state.player.queue[state.player.currentIndex]?.id ?? null) : null;
