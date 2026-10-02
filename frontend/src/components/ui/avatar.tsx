import { Avatar as AvatarPrimitive } from "radix-ui";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export function getInitials(name: string): string {
	const parts = name.trim().split(/\s+/).filter(Boolean);
	const first = parts[0]?.[0] ?? "";
	const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
	return (first + last).toUpperCase() || "?";
}

interface AvatarProps extends ComponentProps<typeof AvatarPrimitive.Root> {
	name: string;
	src?: string | null;
}

export function Avatar({ name, src, className, ...props }: AvatarProps) {
	return (
		<AvatarPrimitive.Root
			className={cn(
				"relative flex size-10 shrink-0 overflow-hidden rounded-full bg-surface-hover",
				className,
			)}
			{...props}
		>
			{src && <AvatarPrimitive.Image src={src} alt={name} className="size-full object-cover" />}
			<AvatarPrimitive.Fallback
				delayMs={src ? 300 : 0}
				aria-label={name}
				className="flex size-full items-center justify-center font-semibold text-foreground text-sm"
			>
				{getInitials(name)}
			</AvatarPrimitive.Fallback>
		</AvatarPrimitive.Root>
	);
}
