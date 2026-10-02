import { Music2 } from "lucide-react";
import { TrackList } from "@/components/music/track-list";
import { EmptyState } from "@/components/ui/empty-state";
import type { Song } from "@/types/contracts";

export function AlbumTracksSection({ songs, albumTitle }: { songs: Song[]; albumTitle: string }) {
	if (songs.length === 0) {
		return <EmptyState icon={<Music2 />} title="No tracks yet" description="This album has no songs." />;
	}

	return (
		<section aria-label="Tracks" className="px-2 pb-8 md:px-4">
			<TrackList
				songs={songs}
				label={`Tracks on ${albumTitle}`}
				showCover={false}
				showPlays
				useTrackNumbers
			/>
		</section>
	);
}
