import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { baseApi } from "@/api/base-api";
import { makeListenerMiddleware } from "@/store/listeners/listener-middleware";
import { rootReducer } from "@/store/root-reducer";

/** A factory, never a singleton: each server request must get its own store. */
export function makeStore() {
	const store = configureStore({
		reducer: rootReducer,
		middleware: (getDefault) => getDefault().concat(baseApi.middleware, makeListenerMiddleware()),
	});
	setupListeners(store.dispatch);
	return store;
}

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
