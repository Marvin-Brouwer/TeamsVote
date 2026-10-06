import { azureStaticWebappAdapter } from '@rooted-adapters/azure-static-webapp'
import { rootedManifest } from '@rooted/application'
import { rootedMarkdown } from '@rooted/markdown/vite'
import { generateRouteManifest } from '@rooted/router/manifest'
import { routeSeoPlugin } from '@rooted/seo/router'

// WEB_URL is where the app is hosted, set by the deploy workflow. Its path becomes Vite's `base`, which needs a trailing slash.
const webUrl = new URL(process.env.WEB_URL ?? 'http://localhost:5173/')
if (!webUrl.pathname.endsWith('/')) webUrl.pathname += '/'

export default rootedManifest({
	webManifest: {
		id: 't-vote',
		url: webUrl.href,
		name: 'TVote',
		short_name: 'TVote',
		description: 'Scrum voting in Microsoft Teams, but simple.',
		theme_color: '#5b5fc7',
		background_color: '#ffffff',
		display: 'standalone',
	},
	seo: {
		// The meeting tab is no use to a search engine, and the rest is a handful of pages.
		robots: { content: 'User-agent: *\nDisallow: /\n' },
		llmsTxt: false,
	},
	plugins: [
		rootedMarkdown(),
		generateRouteManifest({
			glob: './src/**/_routes.mts',
			routeManifestPath: './src/_routes.g.mts',
		}),
		routeSeoPlugin(),
		// Every page is static, pre-rendered to its own file. With no dynamic routes the choice only says
		// what unknown paths get, and that's a 404.
		azureStaticWebappAdapter({ dynamicRoutes: 'not-found' }),
	],
	codeSplitting: {
		groups: [
			{ name: 'vendor/fluent', test: id => id.includes('@fluentui/') || id.includes('@microsoft/fast-') || id.includes('focusgroup-polyfill') },
			{ name: 'vendor/teams', test: id => id.includes('@microsoft/teams-js') },
		],
	},
})
