import { component } from '@rooted/components'
import { href, Link } from '@rooted/router'

import styles from './content-page.css'

export type ContentPageOptions = {
	readonly children: readonly (Node | string)[]
}

/** The frame around the pages people open in a browser: the home page and the legal pages. */
export const ContentPage = component<ContentPageOptions>({
	name: 'content-page',
	styles,
	onMount({ append, element, create, options }) {
		append(
			element('div', {
				classes: styles.root,
				children: [
					element('header', {
						classes: styles.header,
						children: create(Link, {
							href: href.path('/'),
							classes: styles.brand,
							children: 'TVote',
						}),
					}),
					element('main', {
						classes: styles.main,
						children: [...options.children],
					}),
					element('footer', {
						classes: styles.footer,
						children: [
							create(Link, {
								href: href.path('/privacy/'),
								children: 'Privacy',
							}),
							create(Link, {
								href: href.path('/terms/'),
								children: 'Terms',
							}),
							element('a', {
								href: 'https://github.com/Marvin-Brouwer/TeamsVote',
								target: '_blank',
								rel: 'noopener noreferrer',
								textContent: 'Source',
							}),
						],
					}),
				],
			}),
		)
	},
})
