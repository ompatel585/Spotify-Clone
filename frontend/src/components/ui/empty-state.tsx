import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

interface EmptyStateProps extends Omit<ComponentProps<"div">, "title"> {
	icon?: ReactNode;
	title: string;
	description?: string;
	action?: ReactNode;
}

export function EmptyState({ icon, title, description, action, className, ...props }: EmptyStateProps) {
	return (
		<div
			className={cn("flex flex-col items-center justify-center gap-3 px-6 py-12 text-center", className)}
			{...props}
		>
			{icon && (
				<div aria-hidden="true" className="text-subtle [&>svg]:size-12">
					{icon}
				</div>
			)}
			<h3 className="font-bold text-foreground text-xl">{title}</h3>
			{description && <p className="max-w-sm text-muted text-sm">{description}</p>}
			{action && <div className="mt-2">{action}</div>}
		</div>
	);
}
