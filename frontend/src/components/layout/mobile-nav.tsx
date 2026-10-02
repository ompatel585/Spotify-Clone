import { NavLink } from "@/components/layout/nav-link";
import { mobileNavItems } from "@/constants/navigation";

/** Bottom navigation, only visible below the `md` breakpoint. */
export function MobileNav() {
	return (
		<nav aria-label="Main" className="shrink-0 rounded-lg bg-surface md:hidden">
			<ul className="flex">
				{mobileNavItems.map((item) => (
					<li key={item.label} className="flex flex-1">
						<NavLink item={item} layout="tab" />
					</li>
				))}
			</ul>
		</nav>
	);
}
