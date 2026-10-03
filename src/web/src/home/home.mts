import { component } from '@rooted/components'

import { ContentPage } from '../_layout/content-page.mts'
import styles from './home.css'

/** The landing page, and the website URL in the Teams manifest. */
export const HomePage = component({
	name: 'home-page',
	styles,
	onMount({ append, element, create }) {
		document.title = 'TVote · Scrum voting, but simple'

		append(
			create(ContentPage, {
				children: [
					element('h1', {
						textContent: 'Scrum voting, but simple',
					}),
					element('p', {
						classes: styles.lead,
						textContent: 'Every planning poker tool does too much. TVote asks your team for an estimate inside Microsoft Teams, and puts the result back in the chat.',
					}),
					element('h2', {
						textContent: 'How it works',
					}),
					element('ol', {
						classes: styles.steps,
						children: [
							element('li', {
								textContent: 'In a chat or meeting, type "@TVote PROJ-123", or pick TVote from the … under the message box.',
							}),
							element('li', {
								textContent: 'Everyone clicks Vote on the card and picks a card. Nobody sees the others\' votes yet.',
							}),
							element('li', {
								textContent: 'Whoever started it shows the votes, re-votes if needed, and accepts.',
							}),
							element('li', {
								textContent: 'The card in the chat is replaced with the estimate.',
							}),
						],
					}),
					element('h2', {
						textContent: 'What happens to your data',
					}),
					element('p', {
						textContent: 'Your name and vote are kept in memory for as long as the vote runs, and thrown away when it ends. Nothing is stored, nothing is tracked.',
					}),
				],
			}),
		)
	},
})
