import { cn } from "@/lib/cn";

const BAR_DELAYS_MS = [0, 300, 150];

/** Three bouncing bars shown for the track that is playing. Static when the user prefers reduced motion. */
export function EqualizerIcon({ className }: { className?: string }) {
	return (
		<span aria-hidden="true" className={cn("flex h-4 w-4 items-end justify-between gap-0.5", className)}>
			{BAR_DELAYS_MS.map((delay) => (
				<span
					key={delay}
					style={{ animationDelay: `${delay}ms` }}
					className="h-full w-1 origin-bottom animate-equalizer rounded-[1px] bg-primary motion-reduce:scale-y-75 motion-reduce:animate-none"
				/>
			))}
		</span>
	);
}
