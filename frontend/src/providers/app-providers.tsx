"use client";

import type { ReactNode } from "react";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AudioProvider } from "@/providers/audio-provider";
import { SocketProvider } from "@/providers/socket-provider";
import { StoreProvider } from "@/providers/store-provider";

export function AppProviders({ children }: { children: ReactNode }) {
	return (
		<StoreProvider>
			<TooltipProvider delayDuration={200}>
				<SocketProvider>
					<AudioProvider>{children}</AudioProvider>
				</SocketProvider>
				<Toaster
					theme="dark"
					position="bottom-center"
					toastOptions={{
						classNames: {
							toast: "!bg-surface-highlight !text-foreground !border-border",
						},
					}}
				/>
			</TooltipProvider>
		</StoreProvider>
	);
}
