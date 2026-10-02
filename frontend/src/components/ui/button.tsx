import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import type { ComponentProps } from "react";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/cn";

export const buttonVariants = cva(
	"inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50 aria-busy:cursor-progress",
	{
		variants: {
			variant: {
				primary:
					"rounded-full bg-primary text-primary-foreground hover:scale-[1.03] hover:bg-primary-hover active:scale-100",
				secondary: "rounded-full bg-foreground text-background hover:scale-[1.03] active:scale-100",
				outline: "rounded-full border border-subtle text-foreground hover:border-foreground",
				ghost: "rounded-md text-muted hover:bg-surface-hover hover:text-foreground",
				danger: "rounded-full bg-danger text-background hover:brightness-110",
				link: "rounded-sm text-foreground underline-offset-4 hover:text-primary hover:underline",
			},
			size: {
				sm: "h-8 px-4 text-sm",
				md: "h-10 px-6 text-sm",
				lg: "h-12 px-8 text-base",
				icon: "size-10 p-0",
			},
		},
		defaultVariants: { variant: "primary", size: "md" },
	},
);

export interface ButtonProps extends ComponentProps<"button">, VariantProps<typeof buttonVariants> {
	asChild?: boolean;
	loading?: boolean;
}

export function Button({
	className,
	variant,
	size,
	asChild = false,
	loading = false,
	disabled,
	children,
	...props
}: ButtonProps) {
	const classes = cn(buttonVariants({ variant, size }), className);

	if (asChild) {
		return (
			<Slot.Root className={classes} {...props}>
				{children}
			</Slot.Root>
		);
	}

	return (
		<button
			type="button"
			className={classes}
			disabled={disabled || loading}
			aria-busy={loading || undefined}
			{...props}
		>
			{loading && <Spinner />}
			{children}
		</button>
	);
}
