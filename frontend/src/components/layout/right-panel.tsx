"use client";

import { QueuePanel } from "@/components/player/queue-panel";
import { FriendsActivity } from "@/components/social/friends-activity";
import type { RightPanel as RightPanelView } from "@/types/player.types";

/** The shell's third column (`lg` up): friend activity by default, the queue while it is toggled on. */
export function RightPanel({ view }: { view: RightPanelView }) {
	return (
		<div className="size-full overflow-hidden rounded-lg bg-surface">
			{view === "queue" ? <QueuePanel docked /> : <FriendsActivity />}
		</div>
	);
}
