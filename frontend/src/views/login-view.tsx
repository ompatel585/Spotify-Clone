import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";
import { routes } from "@/constants/routes";
import { getSafeRedirectPath } from "@/utils/safe-redirect";

interface LoginViewProps {
	next?: string | string[];
	googleFailed: boolean;
	expired: boolean;
}

function getInitialError({ googleFailed, expired }: Pick<LoginViewProps, "googleFailed" | "expired">) {
	if (googleFailed) return "Google sign-in failed. Please try again or use your email.";
	if (expired) return "Your session has expired. Please log in again.";
	return null;
}

export function LoginView({ next, googleFailed, expired }: LoginViewProps) {
	const nextPath = getSafeRedirectPath(next);
	const registerHref =
		nextPath === "/" ? routes.register : `${routes.register}?next=${encodeURIComponent(nextPath)}`;

	return (
		<AuthCard
			title="Log in to Spotify"
			footer={
				<>
					Don&apos;t have an account?{" "}
					<Link href={registerHref} className="font-semibold text-foreground underline hover:text-primary">
						Sign up
					</Link>
				</>
			}
		>
			<LoginForm next={nextPath} initialError={getInitialError({ googleFailed, expired })} />
		</AuthCard>
	);
}
