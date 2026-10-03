import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RightPanel } from "@/types/player.types";

interface UiState {
	/** What the right panel shows. Friends is the desktop default; the queue temporarily takes its place. */
	rightPanel: RightPanel | null;
	/** Where closing the queue returns to. */
	panelBeforeQueue: RightPanel | null;
}

const initialState: UiState = { rightPanel: "friends", panelBeforeQueue: "friends" };

const uiSlice = createSlice({
	name: "ui",
	initialState,
	reducers: {
		toggleRightPanel(state, { payload }: PayloadAction<RightPanel>) {
			if (state.rightPanel === payload) {
				state.rightPanel = payload === "queue" ? state.panelBeforeQueue : null;
				return;
			}
			if (payload === "queue") state.panelBeforeQueue = state.rightPanel;
			state.rightPanel = payload;
		},
		/** Closing the queue swaps back to what was there before; closing anything else hides the panel. */
		closeRightPanel(state) {
			state.rightPanel = state.rightPanel === "queue" ? state.panelBeforeQueue : null;
		},
		/** Hides the panel outright (e.g. dragged shut). */
		hideRightPanel(state) {
			state.rightPanel = null;
		},
	},
});

export const { toggleRightPanel, closeRightPanel, hideRightPanel } = uiSlice.actions;
export const uiReducer = uiSlice.reducer;
