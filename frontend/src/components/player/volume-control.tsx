"use client";

import { Volume1, Volume2, VolumeX } from "lucide-react";
import { ControlButton } from "@/components/player/control-button";
import { Slider } from "@/components/ui/slider";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setVolume, toggleMute } from "@/store/slices/player-slice";

export function VolumeControl() {
	const dispatch = useAppDispatch();
	const volume = useAppSelector((state) => state.player.volume);
	const muted = useAppSelector((state) => state.player.muted);
	const level = muted ? 0 : Math.round(volume * 100);
	const Icon = level === 0 ? VolumeX : level < 50 ? Volume1 : Volume2;

	return (
		<div className="flex items-center gap-1">
			<ControlButton label={level === 0 ? "Unmute" : "Mute"} onClick={() => dispatch(toggleMute())}>
				<Icon aria-hidden="true" className="size-5" />
			</ControlButton>
			<Slider
				className="w-24"
				thumbLabel="Volume"
				valueText={`${level}%`}
				value={[level]}
				min={0}
				max={100}
				step={1}
				onValueChange={([value]) => dispatch(setVolume((value ?? 0) / 100))}
			/>
		</div>
	);
}
