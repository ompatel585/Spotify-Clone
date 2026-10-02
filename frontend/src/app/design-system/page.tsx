import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DesignSystemView } from "@/views/design-system-view";

export const metadata: Metadata = { title: "Design system", robots: { index: false, follow: false } };

export default function DesignSystemPage() {
	if (process.env.NODE_ENV === "production") notFound();
	return <DesignSystemView />;
}
