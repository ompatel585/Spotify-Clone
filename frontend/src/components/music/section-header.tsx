import type { ReactNode } from "react";

interface SectionHeaderProps {
	id: string;
	title: string;
	action?: ReactNode;
}

export function SectionHeader({ id, title, action }: SectionHeaderProps) {
	return (
		<div className="mb-4 flex items-end justify-between gap-4">
			<h2 id={id} className="font-bold text-2xl text-foreground tracking-tight">
				{title}
			</h2>
			{action}
		</div>
	);
}
