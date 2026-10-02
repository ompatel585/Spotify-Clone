"use client";

import { Music2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { useAuth } from "@/hooks/use-auth";

function getGreeting(date: Date): string {
	const hour = date.getHours();
	if (hour < 5) return "Good night";
	if (hour < 12) return "Good morning";
	if (hour < 18) return "Good afternoon";
	return "Good evening";
}

export function HomeView() {
	const { user } = useAuth();
	if (!user) return null;
	const firstName = user.name.trim().split(/\s+/)[0] ?? user.name;

	return (
		<div className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-8">
			<h1 className="font-bold text-3xl text-foreground">
				{getGreeting(new Date())}, {firstName}
			</h1>
			<Card>
				<EmptyState
					icon={<Music2 />}
					title="Your music is coming soon"
					description="Albums, playlists and your library will show up here."
				/>
			</Card>
		</div>
	);
}
