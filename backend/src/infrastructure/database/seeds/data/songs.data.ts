export interface SongSeed {
	title: string;
	artist: string;
	/** Kebab-case file name shared by the audio file and the cover. */
	slug: string;
	/** Seconds. */
	duration: number;
	/** Title of the album this song belongs to; omitted for singles. */
	album?: { title: string; trackNumber: number };
}

/** Natural key: title + artist. Media lives in `frontend/public/media/{songs,covers}`. */
export const SONGS: readonly SongSeed[] = [
	{
		title: "City Rain",
		artist: "Urban Echo",
		slug: "city-rain",
		duration: 39,
		album: { title: "Urban Nights", trackNumber: 1 },
	},
	{
		title: "Neon Lights",
		artist: "Night Runners",
		slug: "neon-lights",
		duration: 36,
		album: { title: "Urban Nights", trackNumber: 2 },
	},
	{
		title: "Urban Jungle",
		artist: "City Lights",
		slug: "urban-jungle",
		duration: 36,
		album: { title: "Urban Nights", trackNumber: 3 },
	},
	{
		title: "Neon Dreams",
		artist: "Cyber Pulse",
		slug: "neon-dreams",
		duration: 39,
		album: { title: "Urban Nights", trackNumber: 4 },
	},

	{
		title: "Summer Daze",
		artist: "Coastal Kids",
		slug: "summer-daze",
		duration: 24,
		album: { title: "Coastal Dreaming", trackNumber: 1 },
	},
	{
		title: "Ocean Waves",
		artist: "Coastal Drift",
		slug: "ocean-waves",
		duration: 28,
		album: { title: "Coastal Dreaming", trackNumber: 2 },
	},
	{
		title: "Crystal Rain",
		artist: "Echo Valley",
		slug: "crystal-rain",
		duration: 39,
		album: { title: "Coastal Dreaming", trackNumber: 3 },
	},
	{
		title: "Starlight",
		artist: "Luna Bay",
		slug: "starlight",
		duration: 30,
		album: { title: "Coastal Dreaming", trackNumber: 4 },
	},

	{
		title: "Stay With Me",
		artist: "Sarah Mitchell",
		slug: "stay-with-me",
		duration: 46,
		album: { title: "Midnight Sessions", trackNumber: 1 },
	},
	{
		title: "Midnight Drive",
		artist: "The Wanderers",
		slug: "midnight-drive",
		duration: 41,
		album: { title: "Midnight Sessions", trackNumber: 2 },
	},
	{
		title: "Moonlight Dance",
		artist: "Silver Shadows",
		slug: "moonlight-dance",
		duration: 27,
		album: { title: "Midnight Sessions", trackNumber: 3 },
	},

	{
		title: "Lost in Tokyo",
		artist: "Electric Dreams",
		slug: "lost-in-tokyo",
		duration: 24,
		album: { title: "Eastern Dreams", trackNumber: 1 },
	},
	{
		title: "Neon Tokyo",
		artist: "Future Pulse",
		slug: "neon-tokyo",
		duration: 39,
		album: { title: "Eastern Dreams", trackNumber: 2 },
	},
	{
		title: "Purple Sunset",
		artist: "Dream Valley",
		slug: "purple-sunset",
		duration: 17,
		album: { title: "Eastern Dreams", trackNumber: 3 },
	},

	// Singles
	{ title: "Mountain High", artist: "The Wild Ones", slug: "mountain-high", duration: 40 },
	{ title: "Desert Wind", artist: "Sahara Sons", slug: "desert-wind", duration: 28 },
	{ title: "Winter Dreams", artist: "Arctic Pulse", slug: "winter-dreams", duration: 29 },
	{ title: "Midnight Blues", artist: "Jazz Cats", slug: "midnight-blues", duration: 29 },
];
