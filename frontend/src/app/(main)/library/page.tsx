import type { Metadata } from "next";
import { LibraryView } from "@/views/library-view";

export const metadata: Metadata = { title: "Your Library" };

export default function LibraryPage() {
	return <LibraryView />;
}
