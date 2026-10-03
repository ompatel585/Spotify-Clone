import { Home, Library, MessageCircle, Search } from "lucide-react";
import { routes } from "@/constants/routes";

export interface NavItem {
	label: string;
	href: string;
	icon: typeof Home;
	/** Routes that arrive in later phases are shown but not navigable. */
	available: boolean;
}

export const sidebarNavItems: readonly NavItem[] = [
	{ label: "Home", href: routes.home, icon: Home, available: true },
	{ label: "Search", href: routes.search, icon: Search, available: true },
	{ label: "Library", href: routes.library, icon: Library, available: true },
	{ label: "Messages", href: routes.chat(), icon: MessageCircle, available: false },
];

export const mobileNavItems: readonly NavItem[] = sidebarNavItems.filter((item) => item.label !== "Messages");
