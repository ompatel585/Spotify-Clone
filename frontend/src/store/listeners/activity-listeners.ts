import { emitActivity } from "@/services/socket/socket-client";
import type { AppStartListening } from "@/store/listeners/listener-middleware";
import { selectOwnActivitySongId } from "@/store/selectors/realtime-selectors";

const ACTIVITY_DEBOUNCE_MS = 500;

/** Tells friends what is playing. Skipping through tracks or toggling quickly only sends the settled state. */
export function registerActivityListeners(startListening: AppStartListening) {
	startListening({
		predicate: (_action, current, previous) =>
			selectOwnActivitySongId(current) !== selectOwnActivitySongId(previous),
		effect: async (_action, api) => {
			api.cancelActiveListeners();
			await api.delay(ACTIVITY_DEBOUNCE_MS);
			// Duplicates (e.g. pause then play within the window) are dropped by emitActivity.
			emitActivity(selectOwnActivitySongId(api.getState()));
		},
	});
}
