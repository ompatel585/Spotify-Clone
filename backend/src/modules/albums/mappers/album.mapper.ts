import type { Album, AlbumWithTracks } from "../../../contracts/index.js";
import { toSong } from "../../songs/mappers/song.mapper.js";
import type { AlbumWithSongs, AlbumWithStats } from "../albums.repository.js";

export function toAlbum(album: AlbumWithStats): Album {
	return {
		id: album._id.toString(),
		title: album.title,
		artist: album.artist,
		imageUrl: album.imageUrl,
		releaseYear: album.releaseYear,
		songCount: album.songCount,
		totalDuration: album.totalDuration,
		createdAt: album.createdAt.toISOString(),
	};
}

export function toAlbumWithTracks(album: AlbumWithSongs): AlbumWithTracks {
	return {
		...toAlbum(album),
		songs: album.songs.map((song) => toSong({ ...song, albumTitle: album.title })),
	};
}
