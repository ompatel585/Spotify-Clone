import { Skeleton } from "@/components/ui/skeleton";

export function AlbumSkeleton() {
	return (
		<div aria-busy="true" className="-mt-16 px-4 pt-24 md:px-6">
			<div className="flex flex-col items-center gap-6 md:flex-row md:items-end">
				<Skeleton className="size-48 shrink-0 md:size-58" />
				<div className="flex w-full flex-col items-center gap-3 md:items-start">
					<Skeleton className="h-4 w-12" />
					<Skeleton className="h-12 w-3/4 max-w-md md:h-16" />
					<Skeleton className="h-4 w-48" />
				</div>
			</div>
			<div className="mt-8 flex flex-col gap-3">
				{Array.from({ length: 8 }, (_, index) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: static placeholder list
					<Skeleton key={index} className="h-12 w-full" />
				))}
			</div>
		</div>
	);
}
