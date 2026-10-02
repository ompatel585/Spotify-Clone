export const routes = {
	home: "/",
	login: "/login",
	register: "/register",
	search: "/search",
	library: "/library",
	album: (id: string) => `/albums/${encodeURIComponent(id)}`,
	chat: (userId?: string) => (userId ? `/chat/${encodeURIComponent(userId)}` : "/chat"),
	admin: "/admin",
	adminAlbums: "/admin/albums",
	adminSongs: "/admin/songs",
	adminUsers: "/admin/users",
} as const;
