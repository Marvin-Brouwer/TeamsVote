import { describe, expect, it } from 'vitest'

import { topicMarkdown } from '../src/bot/cards/topic-markdown.mts'

describe('topicMarkdown', () => {
	it('leaves hyphens in issue keys alone', () => {
		// Act
		const markdown = topicMarkdown('PROJ-42')

		// Assert
		expect(markdown).toBe('PROJ-42')
	})

	it('links a Jira URL, labelled with its key', () => {
		// Act
		const markdown = topicMarkdown('https://example.atlassian.net/browse/PROJ-42')

		// Assert
		expect(markdown).toBe('[PROJ-42](https://example.atlassian.net/browse/PROJ-42)')
	})

	it.each([
		['Fix *all* the bugs', 'Fix \\*all\\* the bugs'],
		['snake_case [draft]', 'snake\\_case \\[draft\\]'],
		['# not a heading', '\\# not a heading'],
		['- not a list', '\\- not a list'],
		['1. not a list either', '1\\. not a list either'],
	])('escapes what would change how "%s" looks', (topic, expected) => {
		// Act
		const markdown = topicMarkdown(topic)

		// Assert
		expect(markdown).toBe(expected)
	})
})
