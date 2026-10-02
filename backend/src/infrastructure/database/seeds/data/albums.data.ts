export interface AlbumSeed {
	title: string;
	artist: string;
	imageUrl: string;
	releaseYear: number;
}

/** Natural key: title + artist. Cover files live in `frontend/public/media/albums`. */
export const ALBUMS: readonly AlbumSeed[] = [
	{
		title: "Urban Nights",
		artist: "Various Artists",
		imageUrl: "/media/albums/urban-nights.jpg",
		releaseYear: 2023,
	},
	{
		title: "Coastal Dreaming",
		artist: "Various Artists",
		imageUrl: "/media/albums/coastal-dreaming.jpg",
		releaseYear: 2024,
	},
	{
		title: "Midnight Sessions",
		artist: "Various Artists",
		imageUrl: "/media/albums/midnight-sessions.jpg",
		releaseYear: 2024,
	},
	{
		title: "Eastern Dreams",
		artist: "Various Artists",
		imageUrl: "/media/albums/eastern-dreams.jpg",
		releaseYear: 2025,
	},
];
