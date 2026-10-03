import type { ComponentProps } from "react";
import { IconButton } from "@/components/ui/icon-button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/cn";

interface ControlButtonProps extends Omit<ComponentProps<typeof IconButton>, "aria-label"> {
	label: string;
	/** Highlights the button (shuffle on, repeat on, panel open). */
	active?: boolean;
}

/** Icon button with a tooltip, for the player bar. */
export function ControlButton({ label, active = false, className, children, ...props }: ControlButtonProps) {
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<IconButton
					aria-label={label}
					className={cn("size-8 rounded-full", active && "text-primary hover:text-primary-hover", className)}
					{...props}
				>
					{children}
				</IconButton>
			</TooltipTrigger>
			<TooltipContent>{label}</TooltipContent>
		</Tooltip>
	);
}
