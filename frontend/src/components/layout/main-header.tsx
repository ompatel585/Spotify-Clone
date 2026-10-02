import { Logo } from "@/components/common/logo";
import { UserMenu } from "@/components/layout/user-menu";
import { siteConfig } from "@/config/site";

export function MainHeader() {
	return (
		<header className="sticky top-0 z-10 flex h-16 items-center justify-between bg-background/80 px-6 backdrop-blur">
			<div className="flex items-center gap-2">
				<Logo className="size-8" />
				<span className="font-bold text-foreground text-lg">{siteConfig.name}</span>
			</div>
			<UserMenu />
		</header>
	);
}
