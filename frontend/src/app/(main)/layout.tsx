import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AuthGate } from "@/components/auth/auth-gate";
import { MainHeader } from "@/components/layout/main-header";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function MainLayout({ children }: { children: ReactNode }) {
	return (
		<div className="flex min-h-dvh flex-col">
			<MainHeader />
			<main className="flex-1">
				<AuthGate>{children}</AuthGate>
			</main>
		</div>
	);
}
