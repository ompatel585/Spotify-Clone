import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

interface ErrorFallbackProps {
	title?: string;
	message?: string;
	onRetry?: () => void;
}

export function ErrorFallback({
	title = "Something went wrong",
	message = "An unexpected error occurred. Please try again.",
	onRetry,
}: ErrorFallbackProps) {
	return (
		<EmptyState
			role="alert"
			icon={<TriangleAlert />}
			title={title}
			description={message}
			action={onRetry && <Button onClick={onRetry}>Try again</Button>}
		/>
	);
}
