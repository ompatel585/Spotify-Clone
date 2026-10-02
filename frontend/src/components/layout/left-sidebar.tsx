import { SidebarLibrary } from "@/components/layout/sidebar-library";
import { SidebarNav } from "@/components/layout/sidebar-nav";

export function LeftSidebar() {
	return (
		<aside aria-label="Sidebar" className="flex size-full min-h-0 flex-col gap-2">
			<div className="rounded-lg bg-surface">
				<SidebarNav />
			</div>
			<div className="flex min-h-0 flex-1 flex-col rounded-lg bg-surface">
				<SidebarLibrary />
			</div>
		</aside>
	);
}
