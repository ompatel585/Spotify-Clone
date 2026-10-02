import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { siteConfig } from "@/config/site";
import { inter } from "@/lib/fonts";
import { AppProviders } from "@/providers/app-providers";
import "@/styles/globals.css";

export const metadata: Metadata = {
	metadataBase: new URL(siteConfig.url),
	title: { default: siteConfig.name, template: `%s | ${siteConfig.name}` },
	description: siteConfig.description,
	applicationName: siteConfig.name,
	openGraph: {
		type: "website",
		siteName: siteConfig.name,
		title: siteConfig.name,
		description: siteConfig.description,
	},
};

export const viewport: Viewport = {
	themeColor: siteConfig.themeColor,
	colorScheme: "dark",
};

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="en" className={`dark ${inter.variable}`}>
			<body>
				<AppProviders>{children}</AppProviders>
			</body>
		</html>
	);
}
