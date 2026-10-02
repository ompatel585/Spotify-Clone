/** `localStorage` that never throws (private mode, blocked storage, SSR). */
export const safeLocalStorage: Pick<Storage, "getItem" | "setItem"> = {
	getItem(key) {
		try {
			return window.localStorage.getItem(key);
		} catch {
			return null;
		}
	},
	setItem(key, value) {
		try {
			window.localStorage.setItem(key, value);
		} catch {
			// Persistence is best effort.
		}
	},
};
