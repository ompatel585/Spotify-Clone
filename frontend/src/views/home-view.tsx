import { AlbumsSection } from "@/sections/home/albums-section";
import { GreetingHeader } from "@/sections/home/greeting-header";
import { NewReleasesSection } from "@/sections/home/new-releases-section";

export function HomeView() {
	return (
		<div className="flex flex-col gap-10 px-4 pt-4 pb-8 md:px-6">
			<GreetingHeader />
			<AlbumsSection />
			<NewReleasesSection />
		</div>
	);
}
