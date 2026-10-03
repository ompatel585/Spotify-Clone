"use client";

import { Users, X } from "lucide-react";
import { useMemo } from "react";
import { useListUsersQuery } from "@/api/endpoints/users-api";
import { ErrorFallback } from "@/components/common/error-fallback";
import { ConnectionStatus } from "@/components/social/connection-status";
import { FriendActivityItem } from "@/components/social/friend-activity-item";
import { LoginPrompt } from "@/components/social/login-prompt";
import { EmptyState } from "@/components/ui/empty-state";
import { IconButton } from "@/components/ui/icon-button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectActivities, selectOnlineUserIds } from "@/store/selectors/realtime-selectors";
import { hideRightPanel } from "@/store/slices/ui-slice";
import { type Activity, MAX_PAGE_SIZE, type PublicUser } from "@/types/contracts";

interface FriendRow {
	user: PublicUser;
	online: boolean;
	activity: Activity | null;
}

/** Listening now, then online, then offline; alphabetical inside each group. */
function rank({ online, activity }: FriendRow): number {
	if (activity) return 0;
	return online ? 1 : 2;
}

function FriendsList({ meId }: { meId: string }) {
	const { data, isLoading, isError, refetch } = useListUsersQuery({ limit: MAX_PAGE_SIZE });
	const onlineIds = useAppSelector(selectOnlineUserIds);
	const activities = useAppSelector(selectActivities);

	const rows = useMemo<FriendRow[]>(
		() =>
			(data?.items ?? [])
				.filter((user) => user.id !== meId)
				.map((user) => ({
					user,
					online: onlineIds[user.id] === true || Boolean(activities[user.id]),
					activity: activities[user.id] ?? null,
				}))
				.sort((a, b) => rank(a) - rank(b) || a.user.name.localeCompare(b.user.name)),
		[data, meId, onlineIds, activities],
	);

	if (isLoading) {
		return (
			<div aria-busy="true" className="flex flex-col gap-3 p-2">
				{[0, 1, 2].map((key) => (
					<div key={key} className="flex items-center gap-3">
						<Skeleton className="size-10 rounded-full" />
						<div className="flex flex-1 flex-col gap-1.5">
							<Skeleton className="h-3.5 w-24" />
							<Skeleton className="h-3 w-32" />
						</div>
					</div>
				))}
			</div>
		);
	}
	if (isError) return <ErrorFallback onRetry={() => refetch()} />;
	if (rows.length === 0) {
		return (
			<EmptyState
				icon={<Users />}
				title="No friends yet"
				description="When other people join, you will see what they are listening to here."
			/>
		);
	}

	return (
		<ul aria-label="Friends">
			{rows.map((row) => (
				<FriendActivityItem key={row.user.id} {...row} />
			))}
		</ul>
	);
}

/** "Friend Activity": who is online and what they are playing, live over the socket. */
export function FriendsActivity() {
	const dispatch = useAppDispatch();
	const { user } = useAuth();

	return (
		<section aria-labelledby="friend-activity-title" className="flex h-full flex-col">
			<div className="flex items-center justify-between px-4 pt-4 pb-2">
				<h2 id="friend-activity-title" className="font-bold text-foreground text-lg">
					Friend Activity
				</h2>
				<IconButton
					aria-label="Close friend activity"
					className="size-8"
					onClick={() => dispatch(hideRightPanel())}
				>
					<X aria-hidden="true" className="size-5" />
				</IconButton>
			</div>
			{user && <ConnectionStatus />}
			<div className="min-h-0 flex-1 overflow-y-auto px-2 pb-4 [scrollbar-color:var(--color-subtle)_transparent]">
				{user ? <FriendsList meId={user.id} /> : <LoginPrompt />}
			</div>
		</section>
	);
}
