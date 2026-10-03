import { Skeleton } from "@/components/ui/skeleton";

export function TrackListSkeleton({ rows = 6 }: { rows?: number }) {
	return (
		<div aria-hidden="true" className="flex flex-col gap-4 px-4 py-2">
			{Array.from({ length: rows }, (_, index) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: static placeholder list
				<div key={index} className="flex items-center gap-4">
					<Skeleton className="h-4 w-4" />
					<Skeleton className="size-10 shrink-0 rounded-sm" />
					<div className="flex flex-1 flex-col gap-2">
						<Skeleton className="h-4 w-1/3" />
						<Skeleton className="h-3 w-1/4" />
					</div>
					<Skeleton className="h-3 w-10" />
				</div>
			))}
		</div>
	);
}
