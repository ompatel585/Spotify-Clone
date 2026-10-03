"use client";

import { TrendingUp } from "lucide-react";
import { useTrendingSongsQuery } from "@/api/endpoints/discovery-api";
import { SongShelfSection } from "@/sections/home/song-shelf-section";
import { SECTION_SIZE } from "@/types/contracts";

export function TrendingSection() {
	const { data, isLoading, isError, error, refetch } = useTrendingSongsQuery({ limit: SECTION_SIZE });

	return (
		<SongShelfSection
			id="trending"
			title="Trending"
			songs={data}
			isLoading={isLoading}
			isError={isError}
			error={error}
			onRetry={() => refetch()}
			emptyIcon={<TrendingUp />}
			emptyDescription="Nothing has been played this week yet."
		/>
	);
}
