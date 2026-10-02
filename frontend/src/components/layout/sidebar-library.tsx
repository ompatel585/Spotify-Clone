"use client";

import { Disc3 } from "lucide-react";
import Link from "next/link";
import { useListAlbumsQuery } from "@/api/endpoints/albums-api";
import { CoverImage } from "@/components/common/cover-image";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { routes } from "@/constants/routes";
import { getErrorMessage } from "@/utils/errors";

const ROW_CLASS = "flex items-center gap-3 rounded-md p-2";

function LibrarySkeleton() {
	return (
		<div aria-hidden="true" className="flex flex-col">
			{Array.from({ length: 7 }, (_, index) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: static placeholder list
				<div key={index} className={ROW_CLASS}>
					<Skeleton className="size-12 shrink-0" />
					<div className="flex flex-1 flex-col gap-2">
						<Skeleton className="h-3.5 w-3/4" />
						<Skeleton className="h-3 w-1/2" />
					</div>
				</div>
			))}
		</div>
	);
}

export function SidebarLibrary() {
	const { data, isLoading, isError, error, refetch } = useListAlbumsQuery({ limit: 50 });

	return (
		<section aria-labelledby="library-heading" className="flex min-h-0 flex-1 flex-col">
			<div className="flex items-center gap-3 px-5 py-3 text-muted">
				<Disc3 aria-hidden="true" className="size-6" />
				<h2 id="library-heading" className="font-bold text-base">
					Albums
				</h2>
			</div>
			<ScrollArea className="min-h-0 flex-1">
				<div className="px-3 pb-3">
					{isLoading && <LibrarySkeleton />}
					{isError && (
						<div role="alert" className="flex flex-col items-start gap-3 px-2 py-4 text-sm">
							<p className="text-muted">{getErrorMessage(error)}</p>
							<Button size="sm" variant="outline" onClick={() => refetch()}>
								Retry
							</Button>
						</div>
					)}
					{data && data.items.length === 0 && <p className="px-2 py-4 text-muted text-sm">No albums yet.</p>}
					{data && data.items.length > 0 && (
						<ul>
							{data.items.map((album) => (
								<li key={album.id}>
									<Link
										href={routes.album(album.id)}
										className={`${ROW_CLASS} transition-colors hover:bg-surface-hover focus-visible:bg-surface-hover`}
									>
										<CoverImage
											src={album.imageUrl}
											alt=""
											sizes="48px"
											className="size-12 shrink-0 rounded-md"
										/>
										<div className="min-w-0">
											<p className="truncate font-medium text-base text-foreground">{album.title}</p>
											<p className="truncate text-muted text-sm">Album • {album.artist}</p>
										</div>
									</Link>
								</li>
							))}
						</ul>
					)}
				</div>
			</ScrollArea>
		</section>
	);
}
