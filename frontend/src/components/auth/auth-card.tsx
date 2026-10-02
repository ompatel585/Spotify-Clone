import type { ReactNode } from "react";

interface AuthCardProps {
	title: string;
	children: ReactNode;
	footer: ReactNode;
}

export function AuthCard({ title, children, footer }: AuthCardProps) {
	return (
		<section className="w-full max-w-md rounded-xl bg-surface px-6 py-8 sm:px-10 sm:py-10">
			<h1 className="mb-8 text-center font-bold text-3xl text-foreground sm:text-4xl">{title}</h1>
			{children}
			<p className="mt-8 border-border border-t pt-6 text-center text-muted text-sm">{footer}</p>
		</section>
	);
}
