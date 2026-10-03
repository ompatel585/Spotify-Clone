"use client";

import { ChevronLeft, ChevronRight, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { UserMenu } from "@/components/layout/user-menu";
import { IconButton } from "@/components/ui/icon-button";
import { cn } from "@/lib/cn";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleRightPanel } from "@/store/slices/ui-slice";

export function Topbar() {
	const router = useRouter();
	const dispatch = useAppDispatch();
	const friendsOpen = useAppSelector((state) => state.ui.rightPanel === "friends");

	return (
		<header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between gap-4 bg-background/60 px-4 backdrop-blur-md md:px-6">
			<div className="flex items-center gap-2">
				<IconButton
					aria-label="Go back"
					className="size-8 rounded-full bg-black/60 text-foreground hover:bg-black"
					onClick={() => router.back()}
				>
					<ChevronLeft aria-hidden="true" className="size-5" />
				</IconButton>
				<IconButton
					aria-label="Go forward"
					className="size-8 rounded-full bg-black/60 text-foreground hover:bg-black"
					onClick={() => router.forward()}
				>
					<ChevronRight aria-hidden="true" className="size-5" />
				</IconButton>
			</div>
			<div className="flex items-center gap-2">
				{/* The right panel only exists from `lg` up. */}
				<IconButton
					aria-label="Friend activity"
					aria-pressed={friendsOpen}
					className={cn(
						"hidden size-8 rounded-full lg:inline-flex",
						friendsOpen ? "text-primary hover:text-primary" : "text-muted",
					)}
					onClick={() => dispatch(toggleRightPanel("friends"))}
				>
					<Users aria-hidden="true" className="size-5" />
				</IconButton>
				<UserMenu />
			</div>
		</header>
	);
}
