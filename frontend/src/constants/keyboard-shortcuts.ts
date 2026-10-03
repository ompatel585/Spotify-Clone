export type ShortcutAction =
	| "togglePlay"
	| "seekBackward"
	| "seekForward"
	| "volumeUp"
	| "volumeDown"
	| "toggleMute"
	| "toggleShuffle"
	| "cycleRepeat"
	| "next"
	| "previous";

/** Keys are `KeyboardEvent.key` lower-cased. */
export const SHORTCUTS: Readonly<Record<string, ShortcutAction>> = {
	" ": "togglePlay",
	arrowleft: "seekBackward",
	arrowright: "seekForward",
	arrowup: "volumeUp",
	arrowdown: "volumeDown",
	m: "toggleMute",
	s: "toggleShuffle",
	r: "cycleRepeat",
	n: "next",
	p: "previous",
};
