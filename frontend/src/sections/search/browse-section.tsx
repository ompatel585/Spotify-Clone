import { AlbumsSection } from "@/sections/home/albums-section";

/** Shown while the search box is empty. */
export function BrowseSection() {
	return <AlbumsSection id="browse" title="Browse all" limit={24} eagerCount={6} />;
}
