import type { Metadata } from "next";
import { LoginView } from "@/views/login-view";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
	const { next, error, expired } = await searchParams;
	return <LoginView next={next} googleFailed={error === "google"} expired={expired !== undefined} />;
}
