import { publicEnv } from "@/config/env";

export const siteConfig = {
	name: "Spotify",
	description: "Listen, share and chat in real time.",
	url: publicEnv.NEXT_PUBLIC_SITE_URL,
	themeColor: "#000000",
	backgroundColor: "#000000",
} as const;
