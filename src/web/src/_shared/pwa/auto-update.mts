import { applyUpdate, onUpdateReady } from '@rooted/pwa'

/**
 * Takes a new version as soon as it's ready, instead of waiting for every window to close.
 * Teams keeps its webviews alive for a long time, so waiting would leave the meeting tab on an old build for days.
 * Reloading is safe: the pages only show text, nothing is kept in them.
 */
export function keepUpToDate(): void {
	onUpdateReady(() => {
		void applyUpdate()
	})
}
