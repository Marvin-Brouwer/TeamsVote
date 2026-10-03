/*
 * Fluent 2 web components, themed with the same tokens Teams itself uses.
 * Only imported in the browser: defining custom elements and adopting stylesheets has no place in the pre-render.
 *
 * Each import below defines one element. Add one here before using a new `fluent-*` tag,
 * and add its class to `fluent-elements.d.ts`.
 */
import '@fluentui/web-components/badge.js'
import '@fluentui/web-components/button.js'
import '@fluentui/web-components/divider.js'
import '@fluentui/web-components/dropdown.js'
import '@fluentui/web-components/field.js'
import '@fluentui/web-components/label.js'
import '@fluentui/web-components/listbox.js'
import '@fluentui/web-components/message-bar.js'
import '@fluentui/web-components/option.js'
import '@fluentui/web-components/spinner.js'
import '@fluentui/web-components/text-input.js'
import '@fluentui/web-components/toggle-button.js'

import { teamsDarkTheme, teamsHighContrastTheme, teamsLightTheme, type Theme } from '@fluentui/tokens'
import { setTheme } from '@fluentui/web-components'

import { themeStore, type TeamsTheme } from './theme-store.mts'

const fluentThemes: Record<TeamsTheme, Theme> = {
	default: teamsLightTheme,
	dark: teamsDarkTheme,
	contrast: teamsHighContrastTheme,
}

function applyTheme(theme: TeamsTheme): void {
	setTheme(fluentThemes[theme])
	document.documentElement.dataset.theme = theme
}

/** Applies the current theme, and every theme after it. Called once, when the app starts in the browser. */
export function followTheme(): void {
	applyTheme(themeStore.value)
	themeStore.on('change', ({ detail }) => {
		applyTheme(detail.state)
	})
}
