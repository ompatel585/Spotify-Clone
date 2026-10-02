import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export function Input({ className, type = "text", ...props }: ComponentProps<"input">) {
	return (
		<input
			type={type}
			className={cn(
				"h-12 w-full rounded-md border border-subtle bg-surface-highlight px-3 text-foreground text-sm placeholder:text-subtle hover:border-muted disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-danger",
				className,
			)}
			{...props}
		/>
	);
}
