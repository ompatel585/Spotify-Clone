import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

/** Brand mark: green disc with three sound arcs. */
export function Logo({ className, ...props }: ComponentProps<"svg">) {
	return (
		<svg
			viewBox="0 0 24 24"
			role="img"
			aria-label="Spotify"
			className={cn("size-8 text-primary", className)}
			{...props}
		>
			<circle cx="12" cy="12" r="12" fill="currentColor" />
			<g fill="none" stroke="#000" strokeLinecap="round">
				<path d="M5.5 9.1c4.2-1.2 8.8-.8 12.9 1.4" strokeWidth="2" />
				<path d="M6.3 12.7c3.5-.9 7.2-.5 10.5 1.2" strokeWidth="1.7" />
				<path d="M7.2 16c2.8-.6 5.6-.3 8.2 1" strokeWidth="1.4" />
			</g>
		</svg>
	);
}
