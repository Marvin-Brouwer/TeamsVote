import { component } from '@rooted/components'
import { Markdown, type MarkdownSource } from '@rooted/markdown'

import { ContentPage } from '../_layout/content-page.mts'
import styles from './legal-page.css'

export type LegalPageOptions = {
	/** One of the documents in `/doc`, rendered at build time. These are ours, so the HTML is trusted. */
	readonly source: MarkdownSource
}

export const LegalPage = component<LegalPageOptions>({
	name: 'legal-page',
	styles,
	onMount({ append, create, options }) {
		append(
			create(ContentPage, {
				children: [
					create(Markdown, {
						source: options.source,
						classes: styles.document,
					}),
				],
			}),
		)
	},
})
