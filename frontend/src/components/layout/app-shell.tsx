"use client";

import { type ReactNode, useCallback, useMemo } from "react";
import {
	type Layout,
	type LayoutChangedMeta,
	type PanelSize,
	useDefaultLayout,
} from "react-resizable-panels";
import { LeftSidebar } from "@/components/layout/left-sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { RightPanel } from "@/components/layout/right-panel";
import { Topbar } from "@/components/layout/topbar";
import { PlayerBar } from "@/components/player/player-bar";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { LARGE_SCREEN_QUERY, useMediaQuery } from "@/hooks/use-media-query";
import { safeLocalStorage } from "@/services/storage/local-storage";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { hideRightPanel } from "@/store/slices/ui-slice";

const SIDEBAR_ID = "sidebar";
const MAIN_ID = "main";
const RIGHT_ID = "right";

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
	const dispatch = useAppDispatch();
	const isDesktop = useMediaQuery("(min-width: 768px)", true);
	const isLarge = useMediaQuery(LARGE_SCREEN_QUERY, true);
	const rightPanel = useAppSelector((state) => state.ui.rightPanel);
	const rightView = isDesktop && isLarge ? rightPanel : null;

	// One saved layout per panel set, so the sidebar width survives the right panel opening and closing.
	const panelIds = useMemo(
		() => (rightView ? [SIDEBAR_ID, MAIN_ID, RIGHT_ID] : [SIDEBAR_ID, MAIN_ID]),
		[rightView],
	);
	const { defaultLayout, onLayoutChanged } = useDefaultLayout({
		id: "app-shell",
		panelIds,
		storage: safeLocalStorage,
	});

	// A collapsed right panel is about to unmount; saving that layout would reopen it at zero width.
	const handleLayoutChanged = useCallback(
		(layout: Layout, meta: LayoutChangedMeta) => {
			if (layout[RIGHT_ID] === 0) return;
			onLayoutChanged(layout, meta);
		},
		[onLayoutChanged],
	);

	// Dragging the panel shut hides it; the topbar button brings it back.
	const handleRightResize = useCallback(
		(size: PanelSize, _id: string | number | undefined, previous: PanelSize | undefined) => {
			if (size.inPixels === 0 && previous && previous.inPixels > 0) dispatch(hideRightPanel());
		},
		[dispatch],
	);

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
						onLayoutChanged={handleLayoutChanged}
					>
						<ResizablePanel id={SIDEBAR_ID} defaultSize={320} minSize={240} maxSize={480}>
							<LeftSidebar />
						</ResizablePanel>
						<ResizableHandle aria-label="Resize sidebar" />
						<ResizablePanel id={MAIN_ID} minSize={400}>
							<MainContent>{children}</MainContent>
						</ResizablePanel>
						{rightView && (
							<>
								<ResizableHandle aria-label="Resize right panel" />
								<ResizablePanel
									id={RIGHT_ID}
									defaultSize={280}
									minSize={240}
									maxSize={400}
									collapsible
									collapsedSize={0}
									onResize={handleRightResize}
								>
									<RightPanel view={rightView} />
								</ResizablePanel>
							</>
						)}
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
