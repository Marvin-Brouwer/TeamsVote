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
								textContent: 'Add TVote to your meeting, through Apps. It posts a card in the meeting chat: click Start estimate and fill in what you\'re estimating.',
							}),
							element('li', {
								textContent: 'Everyone clicks their value right on the vote card. Nobody sees the others\' votes yet.',
							}),
							element('li', {
								textContent: 'Whoever started it shows the votes, and the card shows the estimate.',
							}),
							element('li', {
								textContent: 'Not happy with it? They ask for a re-vote, and everyone votes again.',
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
