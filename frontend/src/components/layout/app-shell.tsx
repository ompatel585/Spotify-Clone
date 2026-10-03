"use client";

import type { ReactNode } from "react";
import { useDefaultLayout } from "react-resizable-panels";
import { LeftSidebar } from "@/components/layout/left-sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Topbar } from "@/components/layout/topbar";
import { PlayerBar } from "@/components/player/player-bar";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { useMediaQuery } from "@/hooks/use-media-query";
import { safeLocalStorage } from "@/services/storage/local-storage";

const SIDEBAR_ID = "sidebar";
const MAIN_ID = "main";

function MainContent({ children }: { children: ReactNode }) {
	return (
		<main
			id="main-content"
			className="size-full overflow-y-auto overscroll-contain rounded-lg bg-surface [scrollbar-color:var(--color-subtle)_transparent]"
		>
			<Topbar />
			{children}
		</main>
	);
}

export function AppShell({ children }: { children: ReactNode }) {
	const isDesktop = useMediaQuery("(min-width: 768px)", true);
	const { defaultLayout, onLayoutChanged } = useDefaultLayout({
		id: "app-shell",
		panelIds: [SIDEBAR_ID, MAIN_ID],
		storage: safeLocalStorage,
	});

	return (
		<div className="flex h-dvh flex-col gap-2 bg-background p-2">
			<a
				href="#main-content"
				className="sr-only rounded-md bg-primary px-4 py-2 font-semibold text-primary-foreground focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50"
			>
				Skip to content
			</a>
			<div className="min-h-0 flex-1">
				{isDesktop ? (
					<ResizablePanelGroup
						orientation="horizontal"
						defaultLayout={defaultLayout}
						onLayoutChanged={onLayoutChanged}
					>
						<ResizablePanel id={SIDEBAR_ID} defaultSize={320} minSize={240} maxSize={480}>
							<LeftSidebar />
						</ResizablePanel>
						<ResizableHandle aria-label="Resize sidebar" />
						<ResizablePanel id={MAIN_ID} minSize={400}>
							<MainContent>{children}</MainContent>
						</ResizablePanel>
					</ResizablePanelGroup>
				) : (
					<MainContent>{children}</MainContent>
				)}
			</div>
			<PlayerBar />
			<MobileNav />
		</div>
	);
}
