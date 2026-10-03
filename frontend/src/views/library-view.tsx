"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LikedSongsSection } from "@/sections/library/liked-songs-section";
import { RecentPlaysSection } from "@/sections/library/recent-plays-section";

export function LibraryView() {
	return (
		<div className="flex flex-col gap-6 px-4 pt-4 pb-8 md:px-6">
			<h1 className="font-bold text-3xl text-foreground tracking-tight md:text-4xl">Your Library</h1>
			<Tabs defaultValue="liked">
				<TabsList aria-label="Library">
					<TabsTrigger value="liked">Liked Songs</TabsTrigger>
					<TabsTrigger value="recent">Recently played</TabsTrigger>
				</TabsList>
				<TabsContent value="liked">
					<LikedSongsSection />
				</TabsContent>
				<TabsContent value="recent">
					<RecentPlaysSection />
				</TabsContent>
			</Tabs>
		</div>
	);
}
