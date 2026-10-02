import type { ReactNode } from "react";

export function CardGrid({ children }: { children: ReactNode }) {
	return (
		<div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-4 2xl:grid-cols-6">
			{children}
		</div>
	);
}
