import { describe, expect, it } from 'vitest'

import { parseMentionCommand } from '../src/bot/mention-command.mts'

describe('parseMentionCommand', () => {
	it.each(['', '  ', 'help', 'HELP', '/help'])('asks for help on %j', text => {
		// Act
		const command = parseMentionCommand(text)

		// Assert
		expect(command).toEqual({ kind: 'help' })
	})

	it('starts with the default deck', () => {
		// Act
		const command = parseMentionCommand(' PROJ-123 ')

		// Assert
		expect(command).toEqual({ kind: 'start', topic: 'PROJ-123', deck: 'modified-fibonacci' })
	})

	it('reads the deck flag wherever it is', () => {
		// Act
		const before = parseMentionCommand('--t-shirt PROJ-123')
		const after = parseMentionCommand('PROJ-123 --fibonacci')

		// Assert
		expect(before).toEqual({ kind: 'start', topic: 'PROJ-123', deck: 't-shirt' })
		expect(after).toEqual({ kind: 'start', topic: 'PROJ-123', deck: 'fibonacci' })
	})

	it('keeps dashes that are part of the topic', () => {
		// Act
		const command = parseMentionCommand('https://example.atlassian.net/browse/PROJ-1')

		// Assert
		expect(command).toMatchObject({ kind: 'start', topic: 'https://example.atlassian.net/browse/PROJ-1' })
	})

	it('explains an unknown deck', () => {
		// Act
		const command = parseMentionCommand('PROJ-1 --tarot')

		// Assert
		expect(command).toEqual({ kind: 'help', problem: 'I don\'t know the deck "tarot".' })
	})

	it('needs a topic next to the deck', () => {
		// Act
		const command = parseMentionCommand('--t-shirt')

		// Assert
		expect(command).toEqual({ kind: 'help', problem: 'Tell me what to estimate.' })
	})
})
