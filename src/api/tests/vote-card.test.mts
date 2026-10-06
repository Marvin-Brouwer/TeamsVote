import { describe, expect, it } from 'vitest'

import { resultCard, voteCard } from '../src/bot/cards/vote-card.mts'
import { createSessionService } from '../src/sessions/session-service.mts'
import { createSessionStore } from '../src/sessions/session-store.mts'

import type { CardElement, IAdaptiveCard, IExecuteAction } from '@microsoft/teams.cards'

const admin = { id: 'admin', name: 'Ada', teamsId: '29:admin' }
const voter = { id: 'voter', name: 'Vic', teamsId: '29:voter' }

function arrangeVotedSession() {
	const service = createSessionService(createSessionStore({ idleTimeoutMs: 1000 }))
	const session = service.start({ topic: 'PROJ-1', deck: 'modified-fibonacci', admin })
	service.vote(session.id, admin, '5')
	service.vote(session.id, voter, '8')
	return { service, session }
}

function buttons(card: IAdaptiveCard): IExecuteAction[] {
	return card.body
		.filter((element): element is Extract<CardElement, { type: 'ActionSet' }> => element.type === 'ActionSet')
		.flatMap(actionSet => actionSet.actions as IExecuteAction[])
}

function actionNames(card: IAdaptiveCard): unknown[] {
	return buttons(card).map(button => (button.data as { action: string }).action)
}

describe('the vote card everyone sees', () => {
	it('says who voted, but not what', () => {
		// Arrange
		const { session } = arrangeVotedSession()

		// Act
		const card = voteCard(session)

		// Assert
		const text = JSON.stringify(card.body)
		expect(text).toContain('2 voted: Ada, Vic')
		expect(text).not.toContain('Your vote')
		expect(text).not.toContain('FactSet')
	})

	it('has a button for every card in the deck, plus "?", and none highlighted', () => {
		// Arrange
		const { session } = arrangeVotedSession()

		// Act
		const votes = buttons(voteCard(session)).filter(button => (button.data as { action: string }).action === 'vote')

		// Assert
		expect(votes.map(button => button.title)).toEqual(['0', '0.5', '1', '2', '3', '5', '8', '13', '20', '40', '100', '?'])
		expect(votes.filter(button => button.style === 'positive')).toEqual([])
	})

	it('asks Teams to refresh it for the starter and everyone who voted', () => {
		// Arrange
		const { session } = arrangeVotedSession()

		// Act
		const card = voteCard(session)

		// Assert
		expect(card.refresh?.userIds).toEqual(['29:admin', '29:voter'])
		expect(card.refresh?.action?.data).toEqual({ action: 'refresh', sessionId: session.id })
	})
})

describe('someone\'s own view of the vote card', () => {
	it('highlights their own vote, and only theirs', () => {
		// Arrange
		const { session } = arrangeVotedSession()

		// Act
		const highlighted = buttons(voteCard(session, voter)).filter(button => button.style === 'positive')

		// Assert
		expect(highlighted.map(button => button.title)).toEqual(['8'])
		expect(JSON.stringify(voteCard(session, voter).body)).toContain('Your vote: 8')
	})

	it('shows the starter the buttons to show the votes, and nobody else', () => {
		// Arrange
		const { session } = arrangeVotedSession()

		// Act
		const forAdmin = actionNames(voteCard(session, admin))
		const forVoter = actionNames(voteCard(session, voter))

		// Assert
		expect(forAdmin).toContain('reveal')
		expect(forVoter).not.toContain('reveal')
	})
})

describe('the vote card once the votes are shown', () => {
	it('shows every vote and the average, and takes the vote buttons away', () => {
		// Arrange
		const { service, session } = arrangeVotedSession()
		service.reveal(session.id, admin.id)

		// Act
		const card = voteCard(session, voter)

		// Assert
		const text = JSON.stringify(card.body)
		expect(text).toContain('"title":"Ada","value":"5"')
		expect(text).toContain('"title":"Vic","value":"8"')
		expect(text).toContain('"text":"5"')
		expect(text).toContain('Average of 2 votes')
		expect(actionNames(card)).toEqual([])
	})

	it('gives the starter only a re-vote', () => {
		// Arrange
		const { service, session } = arrangeVotedSession()
		service.reveal(session.id, admin.id)

		// Act
		const admins = buttons(voteCard(session, admin))

		// Assert
		expect(admins.map(button => button.title)).toEqual(['Re-vote'])
	})

	it('carries the result in its refresh, for when the session is gone', () => {
		// Arrange
		const { service, session } = arrangeVotedSession()
		service.reveal(session.id, admin.id)

		// Act
		const card = voteCard(session)

		// Assert
		expect(card.refresh?.action?.data).toEqual({
			action: 'refresh',
			sessionId: session.id,
			result: { topic: 'PROJ-1', deck: 'modified-fibonacci', startedBy: 'Ada', votes: [['Ada', '5'], ['Vic', '8']] },
		})
	})

	it('keeps the result out of the refresh before the votes are shown', () => {
		// Arrange
		const { session } = arrangeVotedSession()

		// Act
		const card = voteCard(session)

		// Assert
		expect(card.refresh?.action?.data).toEqual({ action: 'refresh', sessionId: session.id })
	})
})

describe('the result card', () => {
	it('shows the result without buttons or refresh', () => {
		// Arrange
		const result = { topic: 'PROJ-1', deck: 'modified-fibonacci', startedBy: 'Ada', votes: [['Ada', '5'], ['Vic', '?']] } as const

		// Act
		const card = resultCard(result)

		// Assert
		const text = JSON.stringify(card.body)
		expect(text).toContain('"title":"Vic","value":"?"')
		expect(text).toContain('"text":"5"')
		expect(text).toContain('Average of 1 vote,')
		expect(card.refresh).toBeUndefined()
		expect(actionNames(card)).toEqual([])
	})

	it('says there is no estimate when nobody voted a card', () => {
		// Arrange
		const result = { topic: 'PROJ-1', deck: 'modified-fibonacci', startedBy: 'Ada', votes: [['Ada', '?']] } as const

		// Act
		const card = resultCard(result)

		// Assert
		expect(JSON.stringify(card.body)).toContain('Nobody voted a card, so there is no estimate.')
	})
})
