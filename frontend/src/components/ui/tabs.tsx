import { Tabs as TabsPrimitive } from "radix-ui";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export const Tabs = TabsPrimitive.Root;

export function TabsList({ className, ...props }: ComponentProps<typeof TabsPrimitive.List>) {
	return <TabsPrimitive.List className={cn("inline-flex items-center gap-2", className)} {...props} />;
}

export function TabsTrigger({ className, ...props }: ComponentProps<typeof TabsPrimitive.Trigger>) {
	return (
		<TabsPrimitive.Trigger
			className={cn(
				"rounded-full bg-surface-hover px-4 py-1.5 font-medium text-foreground text-sm transition-colors hover:bg-subtle disabled:opacity-50 data-[state=active]:bg-foreground data-[state=active]:text-background",
				className,
			)}
			{...props}
		/>
	);
}

export function TabsContent({ className, ...props }: ComponentProps<typeof TabsPrimitive.Content>) {
	return <TabsPrimitive.Content className={cn("mt-4 animate-fade-in", className)} {...props} />;
}
