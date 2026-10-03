import { component } from '@rooted/components'

export type NoticeOptions = {
	readonly intent: 'info' | 'warning' | 'error' | 'success'
	readonly message: string
}

/** One line of feedback, in Fluent's message bar. */
export const Notice = component<NoticeOptions>({
	name: 'notice',
	onMount({ append, element, options }) {
		append(
			element('fluent-message-bar', {
				intent: options.intent,
				textContent: options.message,
			}),
		)
	},
})
