export const tagTypes = [
	"Me",
	"Album",
	"Song",
	"Library",
	"Playlist",
	"Conversation",
	"Message",
	"User",
] as const;

export type TagType = (typeof tagTypes)[number];
