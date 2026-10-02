import type { ReactNode } from "react";
import { Logo } from "@/components/common/logo";
import { siteConfig } from "@/config/site";

export default function AuthLayout({ children }: { children: ReactNode }) {
	return (
		<main className="flex min-h-dvh flex-col items-center justify-center gap-8 bg-linear-to-b from-surface-hover to-60% to-background px-4 py-10">
			<div className="flex items-center gap-2">
				<Logo className="size-10" />
				<span className="font-bold text-2xl text-foreground">{siteConfig.name}</span>
			</div>
			{children}
		</main>
	);
}
