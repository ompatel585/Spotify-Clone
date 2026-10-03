"use client";

import { use } from "react";
import { AudioContext } from "@/providers/audio-provider";

/** The shared audio element, or `null` on the server and before the first client effect. */
export function useAudioElement(): HTMLAudioElement | null {
	return use(AudioContext);
}
