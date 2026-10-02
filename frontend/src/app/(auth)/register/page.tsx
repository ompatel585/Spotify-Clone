import type { Metadata } from "next";
import { RegisterView } from "@/views/register-view";

export const metadata: Metadata = { title: "Sign up" };

export default async function RegisterPage({ searchParams }: PageProps<"/register">) {
	const { next } = await searchParams;
	return <RegisterView next={next} />;
}
