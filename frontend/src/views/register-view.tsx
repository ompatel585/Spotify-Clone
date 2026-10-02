import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { RegisterForm } from "@/components/auth/register-form";
import { routes } from "@/constants/routes";
import { getSafeRedirectPath } from "@/utils/safe-redirect";

export function RegisterView({ next }: { next?: string | string[] }) {
	const nextPath = getSafeRedirectPath(next);
	const loginHref = nextPath === "/" ? routes.login : `${routes.login}?next=${encodeURIComponent(nextPath)}`;

	return (
		<AuthCard
			title="Sign up to start listening"
			footer={
				<>
					Already have an account?{" "}
					<Link href={loginHref} className="font-semibold text-foreground underline hover:text-primary">
						Log in
					</Link>
				</>
			}
		>
			<RegisterForm next={nextPath} />
		</AuthCard>
	);
}
