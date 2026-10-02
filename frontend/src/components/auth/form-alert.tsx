import { TriangleAlert } from "lucide-react";

export function FormAlert({ message }: { message: string | null }) {
	if (!message) return null;
	return (
		<div
			role="alert"
			className="flex items-start gap-2 rounded-md bg-danger/15 px-3 py-2.5 text-danger text-sm"
		>
			<TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
			<span>{message}</span>
		</div>
	);
}
