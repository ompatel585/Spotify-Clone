import { createListenerMiddleware, type TypedStartListening } from "@reduxjs/toolkit";
import { registerPersistenceListeners } from "@/store/listeners/persistence-listeners";
import type { ReducerState } from "@/store/root-reducer";

export type AppStartListening = TypedStartListening<ReducerState>;

/** One per store, never shared between requests. */
export function makeListenerMiddleware() {
	const listenerMiddleware = createListenerMiddleware();
	registerPersistenceListeners(listenerMiddleware.startListening.withTypes<ReducerState>());
	return listenerMiddleware.middleware;
}
