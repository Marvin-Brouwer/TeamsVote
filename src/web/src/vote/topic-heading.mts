import { component } from '@rooted/components'
import { decks, parseTopic, type DeckId } from '@teams-vote/api/contracts'

import styles from './topic-heading.css'

export type TopicHeadingOptions = {
	readonly topic: string
	readonly deck: DeckId
}

/** What's being estimated. A Jira or other link opens in the browser, labelled with the issue key when there is one. */
export const TopicHeading = component<TopicHeadingOptions>({
	name: 'topic-heading',
	styles,
	onMount({ append, element, options }) {
		const topic = parseTopic(options.topic)

		append(
			element('h1', {
				classes: styles.title,
				children: topic.kind === 'link'
					? element('a', { href: topic.url, target: '_blank', rel: 'noopener noreferrer', textContent: topic.label })
					: topic.text,
			}),
			element('p', {
				classes: styles.deck,
				textContent: decks[options.deck].label,
			}),
		)
	},
})
