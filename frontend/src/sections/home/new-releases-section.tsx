"use client";

import { useNewReleasesQuery } from "@/api/endpoints/discovery-api";
import { SongShelfSection } from "@/sections/home/song-shelf-section";
import { SECTION_SIZE } from "@/types/contracts";

export function NewReleasesSection() {
	const { data, isLoading, isError, error, refetch } = useNewReleasesQuery({ limit: SECTION_SIZE });

	return (
		<SongShelfSection
			id="new-releases"
			title="New releases"
			songs={data}
			isLoading={isLoading}
			isError={isError}
			error={error}
			onRetry={() => refetch()}
		/>
	);
}
