import { component, environment } from '@rooted/components'
import { application } from '@rooted/components/application'
import { router } from '@rooted/router/application'

import { appRoutes } from './_routes.g.mts'
import { HomePage } from './home/home.mts'
import { NotFoundPage } from './navigation/not-found.mts'

const Router = router({
	home: HomePage,
	notFound: NotFoundPage,
	...appRoutes,
})

const Application = component({
	name: 't-vote-application',
	onMount({ append, create }) {
		append(create(Router, { scrollBehavior: { scrollToTop: 'skip' } }))
	},
})

// Fluent, the theme and updates only make sense in a real browser. The pre-render gets the plain markup.
if (environment.is('client')) {
	const [{ followTheme }, { keepUpToDate }] = await Promise.all([
		import('./_shared/theme/fluent.mts'),
		import('./_shared/pwa/auto-update.mts'),
	])
	followTheme()
	keepUpToDate()
}

application(Application)
