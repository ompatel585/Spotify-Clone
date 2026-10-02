"use client";

import { useAuth } from "@/hooks/use-auth";
import { useGreeting } from "@/hooks/use-greeting";

export function GreetingHeader() {
	const { user } = useAuth();
	const greeting = useGreeting();
	const firstName = user?.name.trim().split(/\s+/)[0];

	return (
		<h1 className="font-bold text-3xl text-foreground tracking-tight md:text-4xl">
			{firstName ? `${greeting}, ${firstName}` : greeting}
		</h1>
	);
}
