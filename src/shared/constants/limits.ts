/** Pagination */
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
export const MESSAGES_PAGE_SIZE = 30;

/** Discovery section sizes */
export const FEATURED_SIZE = 6;
export const SECTION_SIZE = 8;
export const RECENTLY_PLAYED_SIZE = 12;

/** Auth */
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;
export const NAME_MAX_LENGTH = 60;

/** Chat */
export const MESSAGE_MAX_LENGTH = 2000;
export const TYPING_THROTTLE_MS = 2500;
export const TYPING_TIMEOUT_MS = 5000;

/** Playback: a play counts after this many seconds or this share of the track, whichever comes first. */
export const PLAY_THRESHOLD_SECONDS = 30;
export const PLAY_THRESHOLD_RATIO = 0.5;

/** Search */
export const SEARCH_MAX_LENGTH = 100;

/** Uploads */
export const AUDIO_MAX_BYTES = 25 * 1024 * 1024;
export const IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const AUDIO_MIME_TYPES = [
	"audio/mpeg",
	"audio/mp3",
	"audio/wav",
	"audio/x-wav",
	"audio/ogg",
	"audio/aac",
	"audio/flac",
	"audio/mp4",
	"audio/x-m4a",
] as const;
export const IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"] as const;
