import { Skeleton } from "@/components/ui/skeleton";

export function CardSkeleton() {
	return (
		<div aria-hidden="true" className="flex flex-col gap-3 rounded-lg bg-surface-elevated p-3">
			<Skeleton className="aspect-square w-full rounded-md" />
			<div className="flex flex-col gap-2">
				<Skeleton className="h-4 w-3/4" />
				<Skeleton className="h-3 w-1/2" />
			</div>
		</div>
	);
}
