"use client";

import { useMemo } from "react";
import { useRecentPlaysQuery } from "@/api/endpoints/plays-api";
import { SongShelfSection } from "@/sections/home/song-shelf-section";
import { RECENTLY_PLAYED_SIZE } from "@/types/contracts";

/** Only shown once the user has a listening history. */
export function RecentlyPlayedSection() {
	const { data, isLoading, isError, error, refetch } = useRecentPlaysQuery({ limit: RECENTLY_PLAYED_SIZE });
	const songs = useMemo(() => data?.map((item) => item.song), [data]);

	return (
		<SongShelfSection
			id="recently-played"
			title="Recently played"
			songs={songs}
			isLoading={isLoading}
			isError={isError}
			error={error}
			onRetry={() => refetch()}
			hideWhenEmpty
		/>
	);
}
