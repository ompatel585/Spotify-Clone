/**
 * API contract shared by backend and frontend.
 * This file is mirrored byte-for-byte at `frontend/src/types/contracts.ts`; edit both together
 * (see docs/architecture.md for the routes and socket events these types describe).
 */

/* ─────────────── Constants ─────────────── */

export const UserRole = {
	User: "user",
	Admin: "admin",
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
export const MESSAGES_PAGE_SIZE = 30;
export const FEATURED_SIZE = 6;
export const SECTION_SIZE = 8;
export const RECENTLY_PLAYED_SIZE = 12;

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;
export const NAME_MAX_LENGTH = 60;
export const MESSAGE_MAX_LENGTH = 2000;
export const SEARCH_MAX_LENGTH = 100;

export const TYPING_THROTTLE_MS = 2500;
export const TYPING_TIMEOUT_MS = 5000;

/** A play counts after this many seconds or this share of the track, whichever comes first. */
export const PLAY_THRESHOLD_SECONDS = 30;
export const PLAY_THRESHOLD_RATIO = 0.5;

export const AUDIO_MAX_BYTES = 25 * 1024 * 1024;
export const IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const AUDIO_MIME_TYPES = [
	"audio/mpeg",
	"audio/mp3",
	"audio/wav",
	"audio/x-wav",
	"audio/ogg",
	"audio/aac",
	"audio/flac",
	"audio/mp4",
	"audio/x-m4a",
] as const;
export const IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"] as const;

/* ─────────────── Generic ─────────────── */

export interface Paginated<T> {
	items: T[];
	page: number;
	limit: number;
	total: number;
	totalPages: number;
}

/** Cursor pagination, used for chat history (newest first). */
export interface CursorPage<T> {
	items: T[];
	nextCursor: string | null;
}

export interface PageQuery {
	page?: number;
	limit?: number;
}

export interface CursorQuery {
	cursor?: string;
	limit?: number;
}

/** Shape of every error response returned by the API. */
export interface ApiErrorBody {
	statusCode: number;
	message: string;
	error: string;
	code?: string;
	details?: unknown;
	requestId?: string;
	path?: string;
	timestamp: string;
}

/* ─────────────── Users & auth ─────────────── */

/** What other users can see about someone. */
export interface PublicUser {
	id: string;
	name: string;
	avatarUrl: string | null;
}

/** The signed-in user. */
export interface CurrentUser extends PublicUser {
	email: string;
	role: UserRole;
	createdAt: string;
}

export interface UpdateProfileRequest {
	name?: string;
	avatarUrl?: string | null;
}

export interface UserListQuery extends PageQuery {
	q?: string;
}

export interface RegisterRequest {
	name: string;
	email: string;
	password: string;
}

export interface LoginRequest {
	email: string;
	password: string;
}

export interface AuthResponse {
	user: CurrentUser;
}

export interface AuthProvidersResponse {
	google: boolean;
}

/** Short-lived token used only to authenticate the socket handshake. */
export interface SocketTicketResponse {
	ticket: string;
	expiresIn: number;
}

/* ─────────────── Music ─────────────── */

export interface Song {
	id: string;
	title: string;
	artist: string;
	albumId: string | null;
	albumTitle: string | null;
	trackNumber: number | null;
	imageUrl: string;
	audioUrl: string;
	/** Seconds */
	duration: number;
	playCount: number;
	createdAt: string;
}

export interface Album {
	id: string;
	title: string;
	artist: string;
	imageUrl: string;
	releaseYear: number;
	songCount: number;
	/** Seconds */
	totalDuration: number;
	createdAt: string;
}

export interface AlbumWithTracks extends Album {
	songs: Song[];
}

export interface RecentlyPlayedItem {
	song: Song;
	playedAt: string;
}

export interface LikedSongIdsResponse {
	songIds: string[];
}

export interface RecordPlayRequest {
	songId: string;
}

export type SongSort = "newest" | "oldest" | "title" | "popular";

export interface SongListQuery extends PageQuery {
	q?: string;
	albumId?: string;
	sort?: SongSort;
}

export interface AlbumListQuery extends PageQuery {
	q?: string;
}

/** Admin: create a song from already-uploaded Cloudinary assets. */
export interface CreateSongRequest {
	title: string;
	artist: string;
	albumId?: string | null;
	trackNumber?: number | null;
	duration: number;
	audioUrl: string;
	audioPublicId?: string | null;
	imageUrl: string;
	imagePublicId?: string | null;
}

export type UpdateSongRequest = Partial<CreateSongRequest>;

export interface CreateAlbumRequest {
	title: string;
	artist: string;
	releaseYear: number;
	imageUrl: string;
	imagePublicId?: string | null;
}

export type UpdateAlbumRequest = Partial<CreateAlbumRequest>;

/* ─────────────── Search ─────────────── */

export interface ArtistSummary {
	name: string;
	imageUrl: string;
	songCount: number;
}

export interface SearchQuery {
	q: string;
	limit?: number;
}

export interface SearchResults {
	query: string;
	songs: Song[];
	albums: Album[];
	artists: ArtistSummary[];
}

/* ─────────────── Chat ─────────────── */

export interface ChatMessage {
	id: string;
	conversationId: string;
	senderId: string;
	receiverId: string;
	content: string;
	/** Client-generated id used to reconcile optimistic messages. */
	clientId: string | null;
	createdAt: string;
	readAt: string | null;
}

export interface Conversation {
	id: string;
	participant: PublicUser;
	lastMessage: ChatMessage | null;
	unreadCount: number;
	updatedAt: string;
}

export interface SendMessageRequest {
	receiverId: string;
	content: string;
	clientId: string;
}

export interface MarkReadResult {
	conversationId: string;
	readerId: string;
	readAt: string;
}

/* ─────────────── Stats ─────────────── */

export interface StatsOverview {
	totalSongs: number;
	totalAlbums: number;
	totalArtists: number;
	totalUsers: number;
	totalPlays: number;
	activeUsers7d: number;
}

export interface PlaysPerDay {
	/** YYYY-MM-DD (UTC) */
	date: string;
	plays: number;
}

export interface TopSong {
	song: Song;
	plays: number;
}

export interface StatsRangeQuery {
	days?: number;
	limit?: number;
}

/* ─────────────── Media uploads ─────────────── */

export const UploadKind = {
	Audio: "audio",
	Image: "image",
} as const;
export type UploadKind = (typeof UploadKind)[keyof typeof UploadKind];

export interface UploadSignatureRequest {
	kind: UploadKind;
}

/** Everything the browser needs to upload straight to Cloudinary. */
export interface UploadSignature {
	uploadUrl: string;
	apiKey: string;
	timestamp: number;
	signature: string;
	folder: string;
}

export interface UploadedAsset {
	url: string;
	publicId: string;
	/** Seconds, audio only */
	duration?: number;
}

/* ─────────────── Realtime (Socket.io) ─────────────── */

/** What a user is listening to right now. Built server-side from the song id, never trusted from the client. */
export interface Activity {
	songId: string;
	title: string;
	artist: string;
	imageUrl: string;
	startedAt: string;
}

export interface PresenceSnapshot {
	onlineUserIds: string[];
	activities: Record<string, Activity>;
}

export interface UserIdPayload {
	userId: string;
}

export interface ActivityUpdatedPayload {
	userId: string;
	activity: Activity | null;
}

/** Client → server: `songId` null means paused / idle. */
export interface UpdateActivityPayload {
	songId: string | null;
}

/** Client → server: `userId` is the other participant. */
export interface TypingPayload {
	userId: string;
}

export interface TypingUpdatePayload {
	userId: string;
	isTyping: boolean;
}

/** Client → server: mark everything received from `userId` as read. */
export interface MarkReadPayload {
	userId: string;
}

export type SocketAck<T> = { ok: true; data: T } | { ok: false; error: string };

/** Events the server emits. */
export interface ServerToClientEvents {
	"presence:snapshot": (snapshot: PresenceSnapshot) => void;
	"presence:online": (payload: UserIdPayload) => void;
	"presence:offline": (payload: UserIdPayload) => void;
	"activity:updated": (payload: ActivityUpdatedPayload) => void;
	"message:new": (message: ChatMessage) => void;
	"message:read": (payload: MarkReadResult) => void;
	"typing:update": (payload: TypingUpdatePayload) => void;
	"error:socket": (payload: { message: string }) => void;
}

/** Events the client emits. */
export interface ClientToServerEvents {
	"activity:update": (payload: UpdateActivityPayload) => void;
	"message:send": (payload: SendMessageRequest, ack: (res: SocketAck<ChatMessage>) => void) => void;
	"message:read": (payload: MarkReadPayload, ack?: (res: SocketAck<MarkReadResult>) => void) => void;
	"typing:start": (payload: TypingPayload) => void;
	"typing:stop": (payload: TypingPayload) => void;
}

/** Data attached to every authenticated socket on the server. */
export interface SocketData {
	userId: string;
	role: string;
}

export const SOCKET_PATH = "/socket.io";

/** Room naming both sides agree on: every socket of a user joins this room. */
export const userRoom = (userId: string): string => `user:${userId}`;
