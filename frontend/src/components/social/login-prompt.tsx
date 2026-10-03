import { Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { routes } from "@/constants/routes";

/** Shown in place of friend activity when nobody is signed in. */
export function LoginPrompt() {
	return (
		<EmptyState
			icon={<Users />}
			title="See what friends are playing"
			description="Log in to see who is online and what they are listening to."
			action={
				<Button asChild>
					<Link href={routes.login}>Log in</Link>
				</Button>
			}
		/>
	);
}
