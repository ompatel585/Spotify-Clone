import type { Song } from "@/types/contracts";

export type RepeatMode = "off" | "all" | "one";

/** The part of the player that survives a reload. The queue and current song deliberately do not. */
export interface PlayerPreferences {
	volume: number;
	muted: boolean;
	shuffle: boolean;
	repeat: RepeatMode;
}

export interface PlayQueueRequest {
	songs: readonly Song[];
	/** Position of the song to start with. Omitted: the first song, or a random one while shuffle is on. */
	startIndex?: number;
}

/** Side panels that can be shown next to the main content. */
export type RightPanel = "queue";
