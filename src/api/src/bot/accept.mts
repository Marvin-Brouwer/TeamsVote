import { SessionRuleError } from '../sessions/session.mts'
import { cardMessage, userFromActivity, type BotDependencies } from './bot-context.mts'
import { summaryCard } from './cards/summary-card.mts'

import type { AcceptSubmission } from '../contracts/requests.mts'
import type { ITaskSubmitInvokeActivity, TaskModuleResponse } from '@microsoft/teams.api'
import type { IActivityContext } from '@microsoft/teams.apps'
import type { ILogger } from '@microsoft/teams.common'

type AcceptContext = {
	readonly activity: ITaskSubmitInvokeActivity
	readonly api: IActivityContext['api']
	readonly log: ILogger
}

/**
 * The admin accepted the result. This arrives as a bot turn, so the person behind it is vouched for by Microsoft
 * and no session token is needed. Ends the session and swaps the vote card for the summary.
 */
export async function acceptVote({ sessions }: BotDependencies, { activity, api, log }: AcceptContext): Promise<TaskModuleResponse | undefined> {
	const { sessionId } = activity.value.data as Partial<AcceptSubmission>
	if (typeof sessionId !== 'string') return { task: { type: 'message', value: 'Nothing to accept.' } }

	let accepted
	try {
		accepted = sessions.accept(sessionId, userFromActivity(activity.from).id)
	} catch (error) {
		if (error instanceof SessionRuleError) return { task: { type: 'message', value: error.message } }
		throw error
	}

	const { session, average } = accepted
	if (session.card) {
		await api.conversations.updateActivity(session.card.conversationId, session.card.activityId, cardMessage(summaryCard(session, average)))
			.catch((error: unknown) => log.error('Could not replace the vote card with the summary', error))
	}

	// No body closes the dialog without a message.
	return undefined
}
