import { cloneElement, type ReactElement, useId } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/cn";

interface ControlProps {
	id?: string;
	"aria-describedby"?: string;
	"aria-invalid"?: boolean;
}

interface FormFieldProps {
	label: string;
	/** A single form control (Input, textarea, ...). It receives id and aria wiring. */
	children: ReactElement<ControlProps>;
	hint?: string;
	error?: string;
	className?: string;
}

export function FormField({ label, children, hint, error, className }: FormFieldProps) {
	const baseId = useId();
	const controlId = children.props.id ?? `${baseId}-control`;
	const hintId = `${baseId}-hint`;
	const errorId = `${baseId}-error`;
	const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ") || undefined;

	return (
		<div className={cn("flex flex-col gap-2", className)}>
			<Label htmlFor={controlId}>{label}</Label>
			{cloneElement(children, {
				id: controlId,
				"aria-describedby": describedBy,
				"aria-invalid": error ? true : undefined,
			})}
			{hint && !error && (
				<p id={hintId} className="text-muted text-xs">
					{hint}
				</p>
			)}
			{error && (
				<p id={errorId} role="alert" className="text-danger text-xs">
					{error}
				</p>
			)}
		</div>
	);
}
