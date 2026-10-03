import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { DEFAULT_VOLUME, PREVIOUS_RESTART_THRESHOLD_SECONDS } from "@/constants/player";
import type { Song } from "@/types/contracts";
import type { PlayerPreferences, PlayQueueRequest, RepeatMode } from "@/types/player.types";
import { createSeed, createSeededRandom, shuffleKeepingFirst } from "@/utils/shuffle";

export interface PlayerState extends PlayerPreferences {
	/** Songs in playing order (shuffled while `shuffle` is on). */
	queue: Song[];
	/** The same songs in their natural order, used to undo a shuffle. */
	originalQueue: Song[];
	/** Position in `queue`, or -1 when nothing is loaded. */
	currentIndex: number;
	isPlaying: boolean;
	/** Bumped whenever a track must be (re)started, even if it is the same song. The audio engine keys on it. */
	playId: number;
}

export const initialPlayerState: PlayerState = {
	queue: [],
	originalQueue: [],
	currentIndex: -1,
	isPlaying: false,
	playId: 0,
	shuffle: false,
	repeat: "off",
	volume: DEFAULT_VOLUME,
	muted: false,
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const nextRepeat: Record<RepeatMode, RepeatMode> = { off: "all", all: "one", one: "off" };

interface SeededPlayQueue extends PlayQueueRequest {
	seed: number;
}

function startTrack(state: PlayerState, index: number) {
	state.currentIndex = index;
	state.isPlaying = true;
	state.playId += 1;
}

const playerSlice = createSlice({
	name: "player",
	initialState: initialPlayerState,
	reducers: {
		playQueue: {
			reducer(state, { payload }: PayloadAction<SeededPlayQueue>) {
				if (payload.songs.length === 0) return;
				const random = createSeededRandom(payload.seed);
				const requested =
					payload.startIndex ?? (state.shuffle ? Math.floor(random() * payload.songs.length) : 0);
				const start = clamp(Math.trunc(requested), 0, payload.songs.length - 1);
				state.originalQueue = [...payload.songs];
				state.queue = state.shuffle ? shuffleKeepingFirst(payload.songs, start, random) : [...payload.songs];
				startTrack(state, state.shuffle ? 0 : start);
			},
			prepare: (request: PlayQueueRequest) => ({ payload: { ...request, seed: createSeed() } }),
		},
		play(state) {
			if (state.currentIndex >= 0) state.isPlaying = true;
		},
		pause(state) {
			state.isPlaying = false;
		},
		togglePlay(state) {
			if (state.currentIndex >= 0) state.isPlaying = !state.isPlaying;
		},
		/** Restart the current track from the beginning and play it (repeat one, replay after the end). */
		restartCurrent(state) {
			if (state.currentIndex < 0) return;
			state.isPlaying = true;
			state.playId += 1;
		},
		next(state) {
			if (state.queue.length === 0) return;
			if (state.currentIndex < state.queue.length - 1) {
				startTrack(state, state.currentIndex + 1);
			} else if (state.repeat === "all") {
				startTrack(state, 0);
			} else {
				state.isPlaying = false;
			}
		},
		/** `payload` is how many seconds into the current track the listener is. */
		previous(state, { payload: elapsedSeconds }: PayloadAction<number>) {
			if (state.queue.length === 0) return;
			const atStart = elapsedSeconds <= PREVIOUS_RESTART_THRESHOLD_SECONDS;
			if (atStart && state.currentIndex > 0) {
				startTrack(state, state.currentIndex - 1);
			} else if (atStart && state.repeat === "all" && state.queue.length > 1) {
				startTrack(state, state.queue.length - 1);
			} else {
				// Restarting keeps the play/pause state.
				state.playId += 1;
			}
		},
		playIndex(state, { payload: index }: PayloadAction<number>) {
			if (index >= 0 && index < state.queue.length) startTrack(state, index);
		},
		toggleShuffle: {
			reducer(state, { payload: seed }: PayloadAction<number>) {
				const current = state.queue[state.currentIndex];
				state.shuffle = !state.shuffle;
				if (!current) return;
				const position = Math.max(
					0,
					state.originalQueue.findIndex((song) => song.id === current.id),
				);
				if (state.shuffle) {
					state.queue = shuffleKeepingFirst(state.originalQueue, position, createSeededRandom(seed));
					state.currentIndex = 0;
				} else {
					state.queue = [...state.originalQueue];
					state.currentIndex = position;
				}
			},
			prepare: () => ({ payload: createSeed() }),
		},
		cycleRepeat(state) {
			state.repeat = nextRepeat[state.repeat];
		},
		setVolume(state, { payload }: PayloadAction<number>) {
			state.volume = clamp(payload, 0, 1);
			state.muted = state.volume === 0;
		},
		toggleMute(state) {
			if (state.volume === 0) {
				state.volume = DEFAULT_VOLUME;
				state.muted = false;
			} else {
				state.muted = !state.muted;
			}
		},
		hydratePreferences(state, { payload }: PayloadAction<PlayerPreferences>) {
			state.volume = payload.volume;
			state.muted = payload.muted;
			state.shuffle = payload.shuffle;
			state.repeat = payload.repeat;
		},
	},
});

export const {
	playQueue,
	play,
	pause,
	togglePlay,
	restartCurrent,
	next,
	previous,
	playIndex,
	toggleShuffle,
	cycleRepeat,
	setVolume,
	toggleMute,
	hydratePreferences,
} = playerSlice.actions;
export const playerReducer = playerSlice.reducer;
