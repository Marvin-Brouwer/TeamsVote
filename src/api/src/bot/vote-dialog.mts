import { topicTitle, parseTopic } from '../contracts/topic.mts'
import { cardMessage, userFromActivity, type BotDependencies } from './bot-context.mts'
import { expiredCard } from './cards/expired-card.mts'

import type { VoteButtonData } from './cards/vote-card.mts'
import type { Session, SessionUser } from '../sessions/session.mts'
import type { ITaskFetchInvokeActivity, TaskModuleResponse, UrlTaskModuleTaskInfo } from '@microsoft/teams.api'
import type { IActivityContext } from '@microsoft/teams.apps'

/**
 * Builds the dialog for one participant. The session token goes in the URL fragment,
 * so it's never sent to the web host and doesn't end up in its logs.
 */
export async function voteDialogTask({ tokens, webUrl }: BotDependencies, session: Session, user: SessionUser): Promise<UrlTaskModuleTaskInfo> {
	const token = await tokens.mint({ sessionId: session.id, userId: user.id, userName: user.name })
	return {
		title: topicTitle(parseTopic(session.topic)),
		url: `${webUrl}/teams/vote/${encodeURIComponent(session.id)}/#token=${encodeURIComponent(token)}`,
		width: 'medium',
		height: 'large',
	}
}

type OpenVoteContext = {
	readonly activity: ITaskFetchInvokeActivity
	readonly api: IActivityContext['api']
}

/** The "Vote" button on the vote card. */
export async function openVoteDialog(dependencies: BotDependencies, { activity, api }: OpenVoteContext): Promise<TaskModuleResponse> {
	const { sessionId } = activity.value.data as Partial<VoteButtonData>
	const session = sessionId ? dependencies.sessions.find(sessionId) : undefined

	if (!session || session.ended) {
		// The card outlived its session. Say so on the card too, so nobody else tries.
		if (activity.replyToId) {
			await api.conversations.updateActivity(activity.conversation.id, activity.replyToId, cardMessage(expiredCard()))
				.catch(() => { /* Replacing the card is a courtesy, the message below is what matters. */ })
		}
		return { task: { type: 'message', value: 'This vote has ended or expired.' } }
	}

	const user = userFromActivity(activity.from)
	dependencies.sessions.join(session.id, user)
	return { task: { type: 'continue', value: await voteDialogTask(dependencies, session, user) } }
}
