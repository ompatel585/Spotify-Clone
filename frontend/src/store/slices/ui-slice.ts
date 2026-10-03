import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RightPanel } from "@/types/player.types";

interface UiState {
	rightPanel: RightPanel | null;
}

const initialState: UiState = { rightPanel: null };

const uiSlice = createSlice({
	name: "ui",
	initialState,
	reducers: {
		toggleRightPanel(state, { payload }: PayloadAction<RightPanel>) {
			state.rightPanel = state.rightPanel === payload ? null : payload;
		},
		closeRightPanel(state) {
			state.rightPanel = null;
		},
	},
});

export const { toggleRightPanel, closeRightPanel } = uiSlice.actions;
export const uiReducer = uiSlice.reducer;
