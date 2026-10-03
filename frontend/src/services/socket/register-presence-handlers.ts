import type { AppSocket } from "@/services/socket/socket-client";
import type { AppDispatch } from "@/store";
import {
	activityUpdated,
	presenceSnapshotReceived,
	userCameOnline,
	userWentOffline,
} from "@/store/slices/realtime-slice";
import type { ServerToClientEvents } from "@/types/contracts";

/** Feeds presence and activity events into the realtime slice. Returns a function that removes the handlers. */
export function registerPresenceHandlers(socket: AppSocket, dispatch: AppDispatch): () => void {
	const onSnapshot: ServerToClientEvents["presence:snapshot"] = (snapshot) =>
		dispatch(presenceSnapshotReceived(snapshot));
	const onOnline: ServerToClientEvents["presence:online"] = ({ userId }) => dispatch(userCameOnline(userId));
	const onOffline: ServerToClientEvents["presence:offline"] = ({ userId }) =>
		dispatch(userWentOffline(userId));
	const onActivity: ServerToClientEvents["activity:updated"] = (payload) =>
		dispatch(activityUpdated(payload));
	const onError: ServerToClientEvents["error:socket"] = ({ message }) => {
		if (process.env.NODE_ENV !== "production") console.warn("[socket]", message);
	};

	socket.on("presence:snapshot", onSnapshot);
	socket.on("presence:online", onOnline);
	socket.on("presence:offline", onOffline);
	socket.on("activity:updated", onActivity);
	socket.on("error:socket", onError);

	return () => {
		socket.off("presence:snapshot", onSnapshot);
		socket.off("presence:online", onOnline);
		socket.off("presence:offline", onOffline);
		socket.off("activity:updated", onActivity);
		socket.off("error:socket", onError);
	};
}
