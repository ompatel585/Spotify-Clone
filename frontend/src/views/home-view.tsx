import { Heart, Library, MoreHorizontal, Play, Search } from "lucide-react";
import type { ReactNode } from "react";
import { ApiStatus } from "@/components/common/api-status";
import { Logo } from "@/components/common/logo";
import { ToastDemoButton } from "@/components/common/toast-demo-button";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/ui/empty-state";
import { FormField } from "@/components/ui/form-field";
import { IconButton } from "@/components/ui/icon-button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

function Section({ title, children }: { title: string; children: ReactNode }) {
	return (
		<section className="flex flex-col gap-4">
			<h2 className="font-bold text-2xl">{title}</h2>
			<div className="flex flex-wrap items-start gap-4">{children}</div>
		</section>
	);
}

// Temporary component showcase. Replaced by the real home page in Phase 4.
export function HomeView() {
	return (
		<main className="mx-auto flex max-w-5xl flex-col gap-12 px-6 py-12">
			<header className="flex flex-wrap items-center justify-between gap-4">
				<div className="flex items-center gap-3">
					<Logo className="size-10" />
					<h1 className="font-bold text-3xl">Component showcase</h1>
				</div>
				<ApiStatus />
			</header>

			<Section title="Buttons">
				<Button>Primary</Button>
				<Button variant="secondary">Secondary</Button>
				<Button variant="outline">Outline</Button>
				<Button variant="ghost">Ghost</Button>
				<Button variant="danger">Danger</Button>
				<Button variant="link">Link</Button>
				<Button size="sm">Small</Button>
				<Button size="lg">Large</Button>
				<Button loading>Loading</Button>
				<Button disabled>Disabled</Button>
				<IconButton aria-label="Play" variant="primary">
					<Play aria-hidden="true" className="size-5" />
				</IconButton>
				<IconButton aria-label="Like">
					<Heart aria-hidden="true" className="size-5" />
				</IconButton>
				<Spinner className="size-6 text-primary" />
			</Section>

			<Section title="Inputs">
				<div className="grid w-full max-w-md gap-4">
					<FormField label="Email" hint="We never share your email.">
						<Input type="email" placeholder="you@example.com" />
					</FormField>
					<FormField label="Password" error="Password must be at least 8 characters.">
						<Input type="password" defaultValue="short" />
					</FormField>
				</div>
			</Section>

			<Section title="Cards, avatars and badges">
				<Card className="w-56 hover:bg-surface-hover">
					<Skeleton className="mb-4 aspect-square w-full" />
					<CardHeader>
						<CardTitle>Daily Mix 1</CardTitle>
						<CardDescription>Made for you</CardDescription>
					</CardHeader>
				</Card>
				<Card className="w-56">
					<Skeleton className="mb-3 aspect-square w-full" />
					<Skeleton className="mb-2 h-4 w-3/4" />
					<Skeleton className="h-3 w-1/2" />
				</Card>
				<div className="flex items-center gap-3">
					<Avatar name="Ada Lovelace" />
					<Avatar name="Grace" className="size-14" />
					<Avatar name="Broken image" src="/missing.png" />
				</div>
				<div className="flex flex-wrap items-center gap-2">
					<Badge>Default</Badge>
					<Badge variant="primary">Primary</Badge>
					<Badge variant="warning">Warning</Badge>
					<Badge variant="danger">Danger</Badge>
					<Badge variant="info">Info</Badge>
				</div>
			</Section>

			<Section title="Overlays">
				<Tooltip>
					<TooltipTrigger asChild>
						<IconButton aria-label="Search">
							<Search aria-hidden="true" className="size-5" />
						</IconButton>
					</TooltipTrigger>
					<TooltipContent>Search</TooltipContent>
				</Tooltip>

				<Dialog>
					<DialogTrigger asChild>
						<Button variant="secondary">Open dialog</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Create playlist</DialogTitle>
							<DialogDescription>Give your playlist a name.</DialogDescription>
						</DialogHeader>
						<FormField label="Name">
							<Input placeholder="My playlist" />
						</FormField>
						<DialogFooter>
							<Button>Create</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>

				<AlertDialog>
					<AlertDialogTrigger asChild>
						<Button variant="danger">Delete playlist</Button>
					</AlertDialogTrigger>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Delete this playlist?</AlertDialogTitle>
							<AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>Cancel</AlertDialogCancel>
							<AlertDialogAction>Delete</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<IconButton aria-label="More options">
							<MoreHorizontal aria-hidden="true" className="size-5" />
						</IconButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent>
						<DropdownMenuLabel>Song</DropdownMenuLabel>
						<DropdownMenuItem>Add to playlist</DropdownMenuItem>
						<DropdownMenuItem>Add to queue</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem>Share</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>

				<ToastDemoButton />
			</Section>

			<Section title="Tabs, slider and scroll area">
				<Tabs defaultValue="songs" className="w-full max-w-md">
					<TabsList>
						<TabsTrigger value="songs">Songs</TabsTrigger>
						<TabsTrigger value="albums">Albums</TabsTrigger>
					</TabsList>
					<TabsContent value="songs">
						<p className="text-muted text-sm">Songs panel</p>
					</TabsContent>
					<TabsContent value="albums">
						<p className="text-muted text-sm">Albums panel</p>
					</TabsContent>
				</Tabs>
				<Slider aria-label="Volume" defaultValue={[60]} max={100} className="w-full max-w-md" />
				<ScrollArea className="h-32 w-64 rounded-md border border-border">
					<ul className="p-3 text-muted text-sm">
						{Array.from({ length: 20 }, (_, index) => `Track ${index + 1}`).map((track) => (
							<li key={track} className="py-1">
								{track}
							</li>
						))}
					</ul>
				</ScrollArea>
			</Section>

			<section className="flex flex-col gap-4">
				<h2 className="font-bold text-2xl">Empty state</h2>
				<Card>
					<EmptyState
						icon={<Library />}
						title="Your library is empty"
						description="Save albums and songs you love and they will show up here."
						action={<Button variant="secondary">Browse albums</Button>}
					/>
				</Card>
			</section>
		</main>
	);
}
