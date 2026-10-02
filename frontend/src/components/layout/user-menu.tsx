"use client";

import { LogOut, MonitorSmartphone, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { routes } from "@/constants/routes";
import { useAuth } from "@/hooks/use-auth";
import { getErrorMessage } from "@/utils/errors";

export function UserMenu() {
	const { user, isAdmin, logout, logoutAll } = useAuth();
	if (!user) return null;

	const run = (action: () => Promise<void>) => () => {
		action().catch((error: unknown) => toast.error(getErrorMessage(error)));
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				aria-label={`Account menu for ${user.name}`}
				className="rounded-full p-1 transition-colors hover:bg-surface-hover"
			>
				<Avatar name={user.name} src={user.avatarUrl} className="size-8" />
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="min-w-56">
				<DropdownMenuLabel className="flex flex-col gap-0.5">
					<span className="truncate text-foreground text-sm">{user.name}</span>
					<span className="truncate font-normal">{user.email}</span>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				{isAdmin && (
					<DropdownMenuItem asChild>
						<Link href={routes.admin}>
							<ShieldCheck aria-hidden="true" className="size-4" />
							Admin
						</Link>
					</DropdownMenuItem>
				)}
				<DropdownMenuItem onSelect={run(logout)}>
					<LogOut aria-hidden="true" className="size-4" />
					Log out
				</DropdownMenuItem>
				<DropdownMenuItem onSelect={run(logoutAll)}>
					<MonitorSmartphone aria-hidden="true" className="size-4" />
					Log out of all devices
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
