"use client";

import { Disc3 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useGetSongQuery, useLazyGetSongQuery } from "@/api/endpoints/songs-api";
import { EqualizerIcon } from "@/components/music/equalizer-icon";
import { OnlineIndicator } from "@/components/social/online-indicator";
import { Avatar } from "@/components/ui/avatar";
import { routes } from "@/constants/routes";
import { usePlayCollection } from "@/hooks/use-play-collection";
import { useAppSelector } from "@/store/hooks";
import { isSongPlaying } from "@/store/selectors/player-selectors";
import type { Activity, PublicUser } from "@/types/contracts";
import { getErrorMessage } from "@/utils/errors";

interface FriendActivityItemProps {
	user: PublicUser;
	online: boolean;
	activity: Activity | null;
}

function ListeningTo({ activity }: { activity: Activity }) {
	const playCollection = usePlayCollection();
	// The song details give the album link; the activity itself only carries display fields.
	const { data: song } = useGetSongQuery(activity.songId);
	const [fetchSong, { isFetching }] = useLazyGetSongQuery();
	const playingHere = useAppSelector((state) => isSongPlaying(state, activity.songId));

	const play = async () => {
		try {
			const target = song ?? (await fetchSong(activity.songId, true).unwrap());
			playCollection([target], 0);
		} catch (error) {
			toast.error(getErrorMessage(error));
		}
	};

	return (
		<>
			<button
				type="button"
				onClick={play}
				disabled={isFetching}
				aria-label={`${playingHere ? "Pause" : "Play"} ${activity.title} by ${activity.artist}`}
				className="flex w-full min-w-0 items-center gap-1.5 rounded-sm text-left text-muted text-sm transition-colors hover:text-foreground disabled:cursor-progress"
			>
				<EqualizerIcon className="size-3 shrink-0" />
				<span className="truncate">
					<span className="text-foreground">{activity.title}</span> • {activity.artist}
				</span>
			</button>
			{song?.albumId && song.albumTitle && (
				<Link
					href={routes.album(song.albumId)}
					className="mt-0.5 flex min-w-0 items-center gap-1.5 rounded-sm text-muted text-xs hover:text-foreground hover:underline"
				>
					<Disc3 aria-hidden="true" className="size-3 shrink-0" />
					<span className="truncate">{song.albumTitle}</span>
				</Link>
			)}
		</>
	);
}

/** One friend: avatar with presence, name, and what they are playing (click to play it here). */
export function FriendActivityItem({ user, online, activity }: FriendActivityItemProps) {
	return (
		<li className="flex items-start gap-3 rounded-md p-2 transition-colors hover:bg-surface-hover">
			<div className="relative shrink-0">
				<Avatar name={user.name} src={user.avatarUrl} className="size-10" />
				<OnlineIndicator online={online} />
			</div>
			<div className="min-w-0 flex-1">
				<p className="truncate font-semibold text-foreground text-sm">{user.name}</p>
				{activity ? (
					<ListeningTo activity={activity} />
				) : (
					<p className="text-muted text-xs">{online ? "Online" : "Offline"}</p>
				)}
			</div>
		</li>
	);
}
