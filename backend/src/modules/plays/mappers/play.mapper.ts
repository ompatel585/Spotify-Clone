import type { RecentlyPlayedItem } from "../../../contracts/index.js";
import { toSong } from "../../songs/mappers/song.mapper.js";
import type { RecentPlayRow } from "../plays.repository.js";

export function toRecentlyPlayed(row: RecentPlayRow): RecentlyPlayedItem {
	return { song: toSong(row.song), playedAt: row.playedAt.toISOString() };
}
