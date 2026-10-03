import { parseTopic } from '../../contracts/topic.mts'

/** The topic as Adaptive Card markdown: a link when it's a URL, escaped text otherwise. */
export function topicMarkdown(input: string): string {
	const topic = parseTopic(input)
	if (topic.kind === 'link') return `[${escapeMarkdown(topic.label)}](${topic.url})`
	return escapeMarkdown(topic.text)
}

function escapeMarkdown(text: string): string {
	return text.replaceAll(/[\\`*_[\]()#+\-!>]/g, character => `\\${character}`)
}
