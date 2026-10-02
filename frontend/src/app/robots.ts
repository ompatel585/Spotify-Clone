import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
	return {
		// Only the public auth pages are worth indexing; everything else sits behind a login.
		rules: { userAgent: "*", allow: ["/login", "/register"], disallow: "/" },
		host: siteConfig.url,
	};
}
