import { combineReducers } from "@reduxjs/toolkit";
import { baseApi } from "@/api/base-api";
import { playerReducer } from "@/store/slices/player-slice";
import { uiReducer } from "@/store/slices/ui-slice";

export const rootReducer = combineReducers({
	[baseApi.reducerPath]: baseApi.reducer,
	player: playerReducer,
	ui: uiReducer,
});

/** Derived from the reducer (not the store) so listeners can use it without a circular type. */
export type ReducerState = ReturnType<typeof rootReducer>;
