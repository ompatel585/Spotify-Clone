import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AuthGate } from "@/components/auth/auth-gate";
import { AppShell } from "@/components/layout/app-shell";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function MainLayout({ children }: { children: ReactNode }) {
	return (
		<AuthGate>
			<AppShell>{children}</AppShell>
		</AuthGate>
	);
}
