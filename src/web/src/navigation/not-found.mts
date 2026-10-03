import { component } from '@rooted/components'
import { href, Link } from '@rooted/router'

import { ContentPage } from '../_layout/content-page.mts'

export const NotFoundPage = component({
	name: 'not-found-page',
	onMount({ append, element, create }) {
		append(create(ContentPage, {
			children: [
				element('h1', { textContent: 'Page not found' }),
				element('p', {
					children: ['There\'s nothing here. ', create(Link, { href: href.path('/'), children: 'Go to the home page' }), '.'],
				}),
			],
		}))
	},
})
