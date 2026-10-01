import { createStore } from '@rooted/store'

/** The three themes Teams has. Teams calls light "default". */
export type TeamsTheme = 'default' | 'dark' | 'contrast'

export function isTeamsTheme(value: unknown): value is TeamsTheme {
	return value === 'default' || value === 'dark' || value === 'contrast'
}

/**
 * The theme the app should be in right now. Starts with a guess, so the first paint is close:
 * a `?theme=` in the URL wins (Teams fills that in for tab URLs), otherwise the system preference.
 * Once Teams answers, `teams-host.mts` corrects it, and keeps it in sync when the user switches themes.
 */
export const themeStore = createStore.from<TeamsTheme>(() => {
	if (typeof window === 'undefined') return 'default'

	const fromQuery = new URLSearchParams(window.location.search).get('theme')
	if (isTeamsTheme(fromQuery)) return fromQuery

	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'default'
})
