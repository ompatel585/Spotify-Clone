"use client";

import { type ReactNode, useEffect } from "react";
import { baseApi } from "@/api/base-api";
import { authApi } from "@/api/endpoints/auth-api";
import { refreshSession } from "@/api/reauth-base-query";
import { registerPresenceHandlers } from "@/services/socket/register-presence-handlers";
import {
	disconnectSocket,
	getSocket,
	resyncActivity,
	UNAUTHORIZED_SOCKET_ERROR,
} from "@/services/socket/socket-client";
import { useAppDispatch, useAppSelector, useAppStore } from "@/store/hooks";
import { selectOwnActivitySongId } from "@/store/selectors/realtime-selectors";
import { connectionStatusChanged } from "@/store/slices/realtime-slice";

/** Reads the cached session without starting a `me` request (auth pages must not fetch it). */
const selectMe = authApi.endpoints.me.select();

/**
 * Owns the realtime connection: open while a user is signed in, closed on logout or unmount.
 * A rejected handshake gets one token refresh; if that fails the normal REST auth flow takes over.
 */
export function SocketProvider({ children }: { children: ReactNode }) {
	const dispatch = useAppDispatch();
	const store = useAppStore();
	const userId = useAppSelector((state) => selectMe(state).data?.id);

	useEffect(() => {
		if (!userId) return;
		const socket = getSocket();
		let disposed = false;
		let refreshTried = false;

		const setStatus = (status: Parameters<typeof connectionStatusChanged>[0]) =>
			dispatch(connectionStatusChanged(status));

		const unsubscribePresence = registerPresenceHandlers(socket, dispatch);

		const onConnect = () => {
			refreshTried = false;
			setStatus("connected");
			resyncActivity(selectOwnActivitySongId(store.getState()));
		};

		const onDisconnect = () => setStatus(socket.active ? "reconnecting" : "disconnected");

		const onReconnectAttempt = () => setStatus("reconnecting");

		const onConnectError = (error: Error) => {
			// Transport problems (API down, network): the manager keeps retrying on its own.
			if (socket.active) {
				setStatus("reconnecting");
				return;
			}
			if (error.message !== UNAUTHORIZED_SOCKET_ERROR) {
				setStatus("disconnected");
				return;
			}
			if (refreshTried) {
				// Still rejected after a refresh: let the REST flow decide (it redirects to /login if needed).
				setStatus("disconnected");
				dispatch(baseApi.util.invalidateTags(["Me"]));
				return;
			}
			refreshTried = true;
			setStatus("reconnecting");
			void refreshSession().then((refreshed) => {
				if (disposed) return;
				if (refreshed) {
					socket.connect();
				} else {
					setStatus("disconnected");
					dispatch(baseApi.util.invalidateTags(["Me"]));
				}
			});
		};

		socket.on("connect", onConnect);
		socket.on("disconnect", onDisconnect);
		socket.on("connect_error", onConnectError);
		socket.io.on("reconnect_attempt", onReconnectAttempt);

		setStatus("connecting");
		socket.connect();

		return () => {
			disposed = true;
			unsubscribePresence();
			socket.off("connect", onConnect);
			socket.off("disconnect", onDisconnect);
			socket.off("connect_error", onConnectError);
			socket.io.off("reconnect_attempt", onReconnectAttempt);
			disconnectSocket();
			setStatus("disconnected");
		};
	}, [userId, dispatch, store]);

	return children;
}
