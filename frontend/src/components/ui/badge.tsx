import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

const badgeVariants = cva(
	"inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-semibold text-xs",
	{
		variants: {
			variant: {
				default: "bg-surface-hover text-foreground",
				primary: "bg-primary/15 text-primary",
				success: "bg-primary/15 text-primary",
				warning: "bg-warning/15 text-warning",
				danger: "bg-danger/15 text-danger",
				info: "bg-info/15 text-info",
			},
		},
		defaultVariants: { variant: "default" },
	},
);

export function Badge({
	className,
	variant,
	...props
}: ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
	return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
