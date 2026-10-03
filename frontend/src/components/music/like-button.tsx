"use client";

import { Heart } from "lucide-react";
import { type MouseEvent, useState } from "react";
import { useLikeSongMutation, useUnlikeSongMutation } from "@/api/endpoints/library-api";
import { useIsLiked } from "@/hooks/use-is-liked";
import { cn } from "@/lib/cn";
import type { Song } from "@/types/contracts";

interface LikeButtonProps {
	song: Pick<Song, "id" | "title">;
	className?: string;
	iconClassName?: string;
}

/** Heart toggle for Liked Songs. The UI flips immediately; the API call rolls it back if it fails. */
export function LikeButton({ song, className, iconClassName }: LikeButtonProps) {
	const isLiked = useIsLiked(song.id);
	const [likeSong] = useLikeSongMutation();
	const [unlikeSong] = useUnlikeSongMutation();
	const [popping, setPopping] = useState(false);

	const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
		// Rows play on click; liking must not start playback.
		event.stopPropagation();
		const args = { songId: song.id, title: song.title };
		if (isLiked) {
			void unlikeSong(args);
		} else {
			void likeSong(args);
			setPopping(true);
		}
	};

	return (
		<button
			type="button"
			aria-pressed={isLiked}
			aria-label={isLiked ? "Remove from Liked Songs" : "Save to Liked Songs"}
			title={isLiked ? "Remove from Liked Songs" : "Save to Liked Songs"}
			onClick={handleClick}
			className={cn(
				"inline-flex size-8 shrink-0 items-center justify-center rounded-full transition-colors",
				isLiked ? "text-primary hover:text-primary-hover" : "text-muted hover:text-foreground",
				className,
			)}
		>
			<Heart
				aria-hidden="true"
				onAnimationEnd={() => setPopping(false)}
				className={cn(
					"size-4",
					isLiked && "fill-current",
					popping && "animate-like-pop motion-reduce:animate-none",
					iconClassName,
				)}
			/>
		</button>
	);
}
