import { cn } from "@/lib/cn";

/** Presence dot placed over an avatar's corner. The state is announced by the row text, so it is decorative. */
export function OnlineIndicator({ online, className }: { online: boolean; className?: string }) {
	return (
		<span
			aria-hidden="true"
			data-online={online}
			className={cn(
				"absolute right-0 bottom-0 size-3 rounded-full border-2 border-surface",
				online ? "bg-primary" : "bg-subtle",
				className,
			)}
		/>
	);
}
