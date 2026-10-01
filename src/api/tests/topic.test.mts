import { describe, expect, it } from 'vitest'

import { parseTopic, topicTitle } from '../src/contracts/topic.mts'

describe('parseTopic', () => {
	it('keeps plain text as text', () => {
		// Act
		const topic = parseTopic('  PROJ-123 login page ')

		// Assert
		expect(topic).toEqual({ kind: 'text', text: 'PROJ-123 login page' })
	})

	it('labels a Jira issue link with its key', () => {
		// Act
		const topic = parseTopic('https://example.atlassian.net/browse/PROJ-42')

		// Assert
		expect(topic).toMatchObject({ kind: 'link', label: 'PROJ-42', issueKey: 'PROJ-42' })
	})

	it('labels a Jira board link with the selected issue', () => {
		// Act
		const topic = parseTopic('https://example.atlassian.net/jira/software/projects/PROJ/boards/1?selectedIssue=PROJ-7')

		// Assert
		expect(topic).toMatchObject({ kind: 'link', label: 'PROJ-7' })
	})

	it('labels any other link with its host', () => {
		// Act
		const topic = parseTopic('https://github.com/Marvin-Brouwer/TeamsVote/issues/1')

		// Assert
		expect(topic).toMatchObject({ kind: 'link', label: 'github.com/…' })
	})

	it('does not treat a dotted word as a link', () => {
		// Act
		const topic = parseTopic('example.atlassian.net')

		// Assert
		expect(topicTitle(topic)).toBe('example.atlassian.net')
	})
})
