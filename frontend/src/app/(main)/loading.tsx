import { CardGrid } from "@/components/music/card-grid";
import { CardSkeleton } from "@/components/music/card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function MainLoading() {
	return (
		<div aria-busy="true" className="flex flex-col gap-8 px-4 pb-8 md:px-6">
			<Skeleton className="h-9 w-64" />
			<CardGrid>
				{Array.from({ length: 6 }, (_, index) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: static placeholder list
					<CardSkeleton key={index} />
				))}
			</CardGrid>
		</div>
	);
}
