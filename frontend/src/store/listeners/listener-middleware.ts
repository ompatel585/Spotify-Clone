import { createListenerMiddleware, type TypedStartListening } from "@reduxjs/toolkit";
import { registerActivityListeners } from "@/store/listeners/activity-listeners";
import { registerPersistenceListeners } from "@/store/listeners/persistence-listeners";
import type { ReducerState } from "@/store/root-reducer";

export type AppStartListening = TypedStartListening<ReducerState>;

/** One per store, never shared between requests. */
export function makeListenerMiddleware() {
	const listenerMiddleware = createListenerMiddleware();
	const startListening = listenerMiddleware.startListening.withTypes<ReducerState>();
	registerPersistenceListeners(startListening);
	registerActivityListeners(startListening);
	return listenerMiddleware.middleware;
}
