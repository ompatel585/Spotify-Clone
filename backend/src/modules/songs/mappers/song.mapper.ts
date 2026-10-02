import type { Song } from "../../../contracts/index.js";
import type { SongWithAlbumTitle } from "../songs.repository.js";

export function toSong(song: SongWithAlbumTitle): Song {
	return {
		id: song._id.toString(),
		title: song.title,
		artist: song.artist,
		albumId: song.albumId?.toString() ?? null,
		albumTitle: song.albumTitle,
		trackNumber: song.trackNumber ?? null,
		imageUrl: song.imageUrl,
		audioUrl: song.audioUrl,
		duration: song.duration,
		playCount: song.playCount,
		createdAt: song.createdAt.toISOString(),
	};
}
