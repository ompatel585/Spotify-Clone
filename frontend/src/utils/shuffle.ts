export type RandomFn = () => number;

/** A fresh 32-bit seed. Generated outside reducers so they stay pure. */
export function createSeed(): number {
	return Math.floor(Math.random() * 2 ** 32);
}

/** Small deterministic PRNG (mulberry32), so a shuffle can be replayed from its seed. */
export function createSeededRandom(seed: number): RandomFn {
	let state = seed >>> 0;
	return () => {
		state = (state + 0x6d2b79f5) >>> 0;
		let t = state;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

/** Fisher-Yates shuffle that returns a new array with `items[firstIndex]` pinned to the front. */
export function shuffleKeepingFirst<T>(
	items: readonly T[],
	firstIndex: number,
	random: RandomFn = Math.random,
): T[] {
	const hasFirst = Number.isInteger(firstIndex) && firstIndex >= 0 && firstIndex < items.length;
	const rest = hasFirst ? items.filter((_, index) => index !== firstIndex) : [...items];
	for (let i = rest.length - 1; i > 0; i--) {
		const j = Math.floor(random() * (i + 1));
		const swap = rest[i] as T;
		rest[i] = rest[j] as T;
		rest[j] = swap;
	}
	return hasFirst ? [items[firstIndex] as T, ...rest] : rest;
}
