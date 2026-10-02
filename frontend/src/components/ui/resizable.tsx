"use client";

import type { ComponentProps } from "react";
import { Group, Panel, Separator } from "react-resizable-panels";
import { cn } from "@/lib/cn";

export function ResizablePanelGroup({ className, ...props }: ComponentProps<typeof Group>) {
	return <Group className={cn("size-full", className)} {...props} />;
}

export const ResizablePanel = Panel;

/** Thin drag handle that only shows itself on hover, drag or keyboard focus. */
export function ResizableHandle({ className, ...props }: ComponentProps<typeof Separator>) {
	return (
		<Separator
			className={cn("group relative flex w-2 shrink-0 items-stretch justify-center outline-none", className)}
			{...props}
		>
			<div
				aria-hidden="true"
				className="w-0.5 rounded-full bg-transparent transition-colors group-hover:bg-subtle group-focus-visible:bg-primary group-data-[separator=active]:bg-primary"
			/>
		</Separator>
	);
}
