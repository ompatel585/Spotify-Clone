import { AlbumsSection } from "@/sections/home/albums-section";
import { FeaturedSection } from "@/sections/home/featured-section";
import { GreetingHeader } from "@/sections/home/greeting-header";
import { MadeForYouSection } from "@/sections/home/made-for-you-section";
import { NewReleasesSection } from "@/sections/home/new-releases-section";
import { RecentlyPlayedSection } from "@/sections/home/recently-played-section";
import { TrendingSection } from "@/sections/home/trending-section";

export function HomeView() {
	return (
		<div className="flex flex-col gap-10 px-4 pt-4 pb-8 md:px-6">
			<div className="flex flex-col gap-6">
				<GreetingHeader />
				<FeaturedSection />
			</div>
			<RecentlyPlayedSection />
			<MadeForYouSection />
			<TrendingSection />
			<AlbumsSection />
			<NewReleasesSection />
		</div>
	);
}
