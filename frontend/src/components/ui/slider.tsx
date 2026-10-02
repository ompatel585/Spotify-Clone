import { Slider as SliderPrimitive } from "radix-ui";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

/** Spotify-style slider: thin track that turns green and reveals its thumb on hover or focus. */
export function Slider({
	className,
	value,
	defaultValue,
	...props
}: ComponentProps<typeof SliderPrimitive.Root>) {
	const thumbCount = (value ?? defaultValue ?? [0]).length;

	return (
		<SliderPrimitive.Root
			value={value}
			defaultValue={defaultValue}
			className={cn(
				"group relative flex h-4 w-full touch-none select-none items-center data-[disabled]:opacity-50",
				className,
			)}
			{...props}
		>
			<SliderPrimitive.Track className="relative h-1 grow overflow-hidden rounded-full bg-subtle">
				<SliderPrimitive.Range className="absolute h-full rounded-full bg-foreground group-focus-within:bg-primary group-hover:bg-primary" />
			</SliderPrimitive.Track>
			{Array.from({ length: thumbCount }, (_, index) => (
				<SliderPrimitive.Thumb
					// biome-ignore lint/suspicious/noArrayIndexKey: thumbs are positional and never reordered
					key={index}
					className="block size-3 rounded-full bg-foreground opacity-0 shadow transition-opacity focus-visible:opacity-100 group-hover:opacity-100"
				/>
			))}
		</SliderPrimitive.Root>
	);
}
