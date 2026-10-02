import type { NextConfig } from "next";

const apiOrigin = process.env.API_ORIGIN ?? "http://localhost:5000";

const securityHeaders = [
	{ key: "X-Content-Type-Options", value: "nosniff" },
	{ key: "X-Frame-Options", value: "DENY" },
	{ key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
	{ key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
	reactStrictMode: true,
	poweredByHeader: false,
	transpilePackages: ["@spotify/shared"],
	images: {
		remotePatterns: [
			{ protocol: "https", hostname: "res.cloudinary.com" },
			{ protocol: "https", hostname: "lh3.googleusercontent.com" },
		],
	},
	// The browser only ever talks to this origin; Next proxies API calls so auth cookies stay first-party.
	async rewrites() {
		return [
			{ source: "/api/:path*", destination: `${apiOrigin}/api/:path*` },
			{ source: "/socket.io/:path*", destination: `${apiOrigin}/socket.io/:path*` },
		];
	},
	async headers() {
		return [{ source: "/:path*", headers: securityHeaders }];
	},
};

export default nextConfig;
