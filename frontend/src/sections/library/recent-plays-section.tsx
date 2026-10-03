"use client";

import { History } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { useRecentPlaysQuery } from "@/api/endpoints/plays-api";
import { ErrorFallback } from "@/components/common/error-fallback";
import { TrackList } from "@/components/music/track-list";
import { TrackListSkeleton } from "@/components/music/track-list-skeleton";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { routes } from "@/constants/routes";
import { getErrorMessage } from "@/utils/errors";

const HISTORY_SIZE = 50;

export function RecentPlaysSection() {
	const { data, isLoading, isError, error, refetch } = useRecentPlaysQuery({ limit: HISTORY_SIZE });
	const songs = useMemo(() => data?.map((item) => item.song) ?? [], [data]);

	if (isLoading) return <TrackListSkeleton />;
	if (isError) return <ErrorFallback message={getErrorMessage(error)} onRetry={() => refetch()} />;

	if (songs.length === 0) {
		return (
			<EmptyState
				icon={<History />}
				title="No listening history yet"
				description="Songs you play will show up here."
				action={
					<Button asChild>
						<Link href={routes.home}>Start listening</Link>
					</Button>
				}
			/>
		);
	}

	return (
		<section aria-labelledby="recent-plays-heading" className="flex flex-col gap-4">
			<h2 id="recent-plays-heading" className="font-bold text-2xl text-foreground tracking-tight">
				Recently played
			</h2>
			<TrackList songs={songs} label="Recently played" />
		</section>
	);
}
