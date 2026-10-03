import { isAnyOf } from "@reduxjs/toolkit";
import { PLAYER_PREFERENCES_KEY } from "@/constants/player";
import { safeLocalStorage } from "@/services/storage/local-storage";
import type { AppStartListening } from "@/store/listeners/listener-middleware";
import { cycleRepeat, setVolume, toggleMute, toggleShuffle } from "@/store/slices/player-slice";
import type { PlayerPreferences, RepeatMode } from "@/types/player.types";

const REPEAT_MODES: readonly RepeatMode[] = ["off", "all", "one"];
const SAVE_DEBOUNCE_MS = 250;

function isRepeatMode(value: unknown): value is RepeatMode {
	return REPEAT_MODES.some((mode) => mode === value);
}

/** Reads and validates saved preferences; anything malformed is ignored. */
export function loadPlayerPreferences(): PlayerPreferences | null {
	try {
		const raw = safeLocalStorage.getItem(PLAYER_PREFERENCES_KEY);
		if (!raw) return null;
		const data: unknown = JSON.parse(raw);
		if (typeof data !== "object" || data === null) return null;
		const { volume, muted, shuffle, repeat } = data as Record<string, unknown>;
		if (typeof volume !== "number" || !Number.isFinite(volume)) return null;
		if (typeof muted !== "boolean" || typeof shuffle !== "boolean" || !isRepeatMode(repeat)) return null;
		return { volume: Math.min(1, Math.max(0, volume)), muted, shuffle, repeat };
	} catch {
		return null;
	}
}

export function registerPersistenceListeners(startListening: AppStartListening) {
	startListening({
		matcher: isAnyOf(setVolume, toggleMute, toggleShuffle, cycleRepeat),
		effect: async (_action, api) => {
			// Dragging the volume fires many actions; only the last one is written.
			api.cancelActiveListeners();
			await api.delay(SAVE_DEBOUNCE_MS);
			const { volume, muted, shuffle, repeat } = api.getState().player;
			const preferences: PlayerPreferences = { volume, muted, shuffle, repeat };
			safeLocalStorage.setItem(PLAYER_PREFERENCES_KEY, JSON.stringify(preferences));
		},
	});
}
