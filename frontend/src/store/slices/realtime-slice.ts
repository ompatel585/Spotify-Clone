import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { baseApi } from "@/api/base-api";
import type { Activity, ActivityUpdatedPayload, PresenceSnapshot } from "@/types/contracts";

export type ConnectionStatus = "connecting" | "connected" | "disconnected" | "reconnecting";

export interface RealtimeState {
	status: ConnectionStatus;
	/** False until the first connect attempt, so the "disconnected" banner does not flash on load. */
	attempted: boolean;
	/** Set-like map: a key is present while that user has at least one socket open. */
	onlineUserIds: Record<string, true>;
	activities: Record<string, Activity>;
}

const initialState: RealtimeState = {
	status: "disconnected",
	attempted: false,
	onlineUserIds: {},
	activities: {},
};

const realtimeSlice = createSlice({
	name: "realtime",
	initialState,
	reducers: {
		connectionStatusChanged(state, { payload }: PayloadAction<ConnectionStatus>) {
			state.status = payload;
			if (payload === "connecting") state.attempted = true;
		},
		presenceSnapshotReceived(state, { payload }: PayloadAction<PresenceSnapshot>) {
			state.onlineUserIds = Object.fromEntries(payload.onlineUserIds.map((id) => [id, true as const]));
			state.activities = { ...payload.activities };
		},
		userCameOnline(state, { payload: userId }: PayloadAction<string>) {
			state.onlineUserIds[userId] = true;
		},
		userWentOffline(state, { payload: userId }: PayloadAction<string>) {
			delete state.onlineUserIds[userId];
			delete state.activities[userId];
		},
		activityUpdated(state, { payload }: PayloadAction<ActivityUpdatedPayload>) {
			if (payload.activity) state.activities[payload.userId] = payload.activity;
			else delete state.activities[payload.userId];
		},
		realtimeReset() {
			return initialState;
		},
	},
	extraReducers: (builder) => {
		// Logout and a dead session both reset the API state; presence must not outlive the session.
		builder.addMatcher(baseApi.util.resetApiState.match, () => initialState);
	},
});

export const {
	connectionStatusChanged,
	presenceSnapshotReceived,
	userCameOnline,
	userWentOffline,
	activityUpdated,
	realtimeReset,
} = realtimeSlice.actions;
export const realtimeReducer = realtimeSlice.reducer;
