import { NavLink } from "@/components/layout/nav-link";
import { sidebarNavItems } from "@/constants/navigation";

export function SidebarNav() {
	return (
		<nav aria-label="Main" className="px-3 py-3">
			<ul className="flex flex-col">
				{sidebarNavItems.map((item) => (
					<li key={item.label}>
						<NavLink item={item} layout="row" />
					</li>
				))}
			</ul>
		</nav>
	);
}
