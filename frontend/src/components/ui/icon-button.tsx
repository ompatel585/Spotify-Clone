import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";

type IconButtonProps = Omit<ComponentProps<typeof Button>, "size" | "aria-label"> & {
	/** Icon-only controls have no visible text, so a label is mandatory. */
	"aria-label": string;
};

export function IconButton({ variant = "ghost", ...props }: IconButtonProps) {
	return <Button variant={variant} size="icon" {...props} />;
}
