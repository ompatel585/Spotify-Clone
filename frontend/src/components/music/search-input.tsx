"use client";

import { Search, X } from "lucide-react";
import type { ComponentProps, KeyboardEvent } from "react";
import { cn } from "@/lib/cn";
import { SEARCH_MAX_LENGTH } from "@/types/contracts";

interface SearchInputProps
	extends Omit<ComponentProps<"input">, "type" | "value" | "onChange" | "maxLength"> {
	value: string;
	onValueChange: (value: string) => void;
}

/** Search box with a leading icon, a clear button, and Escape to clear. */
export function SearchInput({ value, onValueChange, className, onKeyDown, ...props }: SearchInputProps) {
	const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
		onKeyDown?.(event);
		if (event.key === "Escape" && value) {
			event.preventDefault();
			onValueChange("");
		}
	};

	return (
		<div className={cn("relative w-full", className)}>
			<Search
				aria-hidden="true"
				className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted"
			/>
			<input
				type="search"
				value={value}
				maxLength={SEARCH_MAX_LENGTH}
				autoComplete="off"
				spellCheck={false}
				enterKeyHint="search"
				onChange={(event) => onValueChange(event.target.value)}
				onKeyDown={handleKeyDown}
				className="h-12 w-full rounded-full border border-transparent bg-surface-highlight pr-12 pl-11 text-base text-foreground placeholder:text-muted hover:border-subtle hover:bg-surface-hover focus-visible:border-foreground focus-visible:outline-none [&::-webkit-search-cancel-button]:appearance-none"
				{...props}
			/>
			{value && (
				<button
					type="button"
					aria-label="Clear search"
					onClick={() => onValueChange("")}
					className="absolute top-1/2 right-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-muted transition-colors hover:text-foreground"
				>
					<X aria-hidden="true" className="size-5" />
				</button>
			)}
		</div>
	);
}
