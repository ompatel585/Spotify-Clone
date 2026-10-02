"use client";

import { Music2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/cn";

interface CoverImageProps {
	src: string | null | undefined;
	alt: string;
	/** Required: tells the browser which rendition to fetch (e.g. "(min-width: 1024px) 200px, 45vw"). */
	sizes: string;
	className?: string;
	/** Above-the-fold art: load right away instead of lazily (Next 16 replaced `priority` with this). */
	eager?: boolean;
}

/** Square cover art. Space is reserved up front; a music-note placeholder shows if the image is missing or fails. */
export function CoverImage({ src, alt, sizes, className, eager }: CoverImageProps) {
	const [failedSrc, setFailedSrc] = useState<string | null>(null);
	const showImage = Boolean(src) && failedSrc !== src;

	return (
		<div className={cn("relative aspect-square overflow-hidden bg-surface-hover", className)}>
			{showImage && src ? (
				<Image
					src={src}
					alt={alt}
					fill
					sizes={sizes}
					loading={eager ? "eager" : "lazy"}
					fetchPriority={eager ? "high" : "auto"}
					onError={() => setFailedSrc(src)}
					className="object-cover"
				/>
			) : (
				<div role="img" aria-label={alt} className="flex size-full items-center justify-center text-subtle">
					<Music2 aria-hidden="true" className="size-1/3" />
				</div>
			)}
		</div>
	);
}
