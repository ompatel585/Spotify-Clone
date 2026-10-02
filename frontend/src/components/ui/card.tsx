import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export function Card({ className, ...props }: ComponentProps<"div">) {
	return <div className={cn("rounded-lg bg-surface-elevated p-4 transition-colors", className)} {...props} />;
}

export function CardHeader({ className, ...props }: ComponentProps<"div">) {
	return <div className={cn("mb-3 flex flex-col gap-1", className)} {...props} />;
}

export function CardTitle({ className, ...props }: ComponentProps<"h3">) {
	return <h3 className={cn("font-bold text-base text-foreground", className)} {...props} />;
}

export function CardDescription({ className, ...props }: ComponentProps<"p">) {
	return <p className={cn("text-muted text-sm", className)} {...props} />;
}

export function CardContent({ className, ...props }: ComponentProps<"div">) {
	return <div className={cn(className)} {...props} />;
}
