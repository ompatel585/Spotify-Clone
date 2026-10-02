"use client";

import { Eye, EyeOff } from "lucide-react";
import { type ComponentProps, useState } from "react";
import { Input } from "@/components/ui/input";

/** Password input with a show/hide toggle. Props (id, aria-*, ref) pass through to the input. */
export function PasswordInput(props: Omit<ComponentProps<"input">, "type">) {
	const [visible, setVisible] = useState(false);
	const Icon = visible ? EyeOff : Eye;

	return (
		<div className="relative">
			<Input {...props} type={visible ? "text" : "password"} className="pr-12" />
			<button
				type="button"
				onClick={() => setVisible((current) => !current)}
				aria-label={visible ? "Hide password" : "Show password"}
				aria-pressed={visible}
				className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-md text-muted hover:text-foreground"
			>
				<Icon aria-hidden="true" className="size-5" />
			</button>
		</div>
	);
}
