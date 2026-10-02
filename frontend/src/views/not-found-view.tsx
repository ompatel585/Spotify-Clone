import Link from "next/link";
import { Logo } from "@/components/common/logo";
import { Button } from "@/components/ui/button";
import { routes } from "@/constants/routes";

export function NotFoundView() {
	return (
		<main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
			<Logo className="size-12" />
			<div className="flex flex-col gap-2">
				<h1 className="font-bold text-4xl text-foreground">Page not found</h1>
				<p className="text-muted">We can&apos;t find the page you&apos;re looking for.</p>
			</div>
			<Button asChild size="lg">
				<Link href={routes.home}>Back to home</Link>
			</Button>
		</main>
	);
}
