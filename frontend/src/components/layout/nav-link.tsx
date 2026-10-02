"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { NavItem } from "@/constants/navigation";
import { cn } from "@/lib/cn";

interface NavLinkProps {
	item: NavItem;
	/** "row" is the sidebar entry, "tab" the stacked icon + label used by the mobile bottom nav. */
	layout: "row" | "tab";
}

const layoutClass = {
	row: "w-full gap-4 rounded-md px-3 py-2 font-bold text-base",
	tab: "flex-1 flex-col gap-1 px-2 py-2 font-medium text-xs",
} as const;

export function NavLink({ item, layout }: NavLinkProps) {
	const pathname = usePathname();
	const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
	const Icon = item.icon;
	const classes = cn(
		"flex items-center transition-colors",
		layoutClass[layout],
		active ? "text-foreground" : "text-muted",
		item.available ? "hover:text-foreground" : "cursor-not-allowed opacity-60",
	);
	const content = (
		<>
			<Icon aria-hidden="true" className="size-6 shrink-0" />
			<span>{item.label}</span>
		</>
	);

	if (item.available) {
		return (
			<Link href={item.href} aria-current={active ? "page" : undefined} className={classes}>
				{content}
			</Link>
		);
	}

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				{/* A button, not a link: the route does not exist yet, so it must never navigate. */}
				<button type="button" aria-disabled="true" className={classes}>
					{content}
					<span className="sr-only"> (coming soon)</span>
				</button>
			</TooltipTrigger>
			<TooltipContent side={layout === "row" ? "right" : "top"}>Coming soon</TooltipContent>
		</Tooltip>
	);
}
