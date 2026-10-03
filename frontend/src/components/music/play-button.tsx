import { Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

interface PlayButtonProps {
	/** What is being played, for the accessible name: "Play Dreamer". */
	subject: string;
	isPlaying: boolean;
	/** The current item keeps the button visible even when it is not hovered. */
	isCurrent?: boolean;
	loading?: boolean;
	onClick: () => void;
	className?: string;
}

/** Round green play/pause. Inside a `group` card it fades in on hover or focus. */
export function PlayButton({
	subject,
	isPlaying,
	isCurrent = false,
	loading,
	onClick,
	className,
}: PlayButtonProps) {
	const Icon = isPlaying ? Pause : Play;
	return (
		<Button
			size="icon"
			loading={loading}
			aria-label={`${isPlaying ? "Pause" : "Play"} ${subject}`}
			onClick={onClick}
			className={cn(
				"size-12 shadow-black/40 shadow-xl transition-[opacity,translate,background-color,scale] duration-200",
				isCurrent
					? "opacity-100"
					: "translate-y-2 opacity-0 focus-visible:translate-y-0 focus-visible:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100 motion-reduce:translate-y-0 motion-reduce:transition-none",
				className,
			)}
		>
			<Icon aria-hidden="true" className="size-5 fill-current" />
		</Button>
	);
}
