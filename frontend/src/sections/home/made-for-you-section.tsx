"use client";

import { Sparkles } from "lucide-react";
import { useMadeForYouQuery } from "@/api/endpoints/discovery-api";
import { SongShelfSection } from "@/sections/home/song-shelf-section";
import { SECTION_SIZE } from "@/types/contracts";

export function MadeForYouSection() {
	const { data, isLoading, isError, error, refetch } = useMadeForYouQuery({ limit: SECTION_SIZE });

	return (
		<SongShelfSection
			id="made-for-you"
			title="Made for you"
			songs={data}
			isLoading={isLoading}
			isError={isError}
			error={error}
			onRetry={() => refetch()}
			emptyIcon={<Sparkles />}
			emptyDescription="Play and like a few songs to get picks made for you."
		/>
	);
}
