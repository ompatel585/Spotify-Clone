"use client";

import { type ReactNode, useRef } from "react";
import { Provider } from "react-redux";
import { type AppStore, makeStore } from "@/store";

export function StoreProvider({ children }: { children: ReactNode }) {
	const storeRef = useRef<AppStore | null>(null);
	storeRef.current ??= makeStore();
	return <Provider store={storeRef.current}>{children}</Provider>;
}
