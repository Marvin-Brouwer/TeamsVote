import { parseTopic } from '../../sessions/topic.mts'

/** The topic as Adaptive Card markdown: a link when it's a URL, escaped text otherwise. */
export function topicMarkdown(input: string): string {
	const topic = parseTopic(input)
	if (topic.kind === 'link') return `[${escapeMarkdown(topic.label)}](${topic.url})`
	return escapeMarkdown(topic.text)
}

// Only what changes how the text looks: emphasis, code and links anywhere, list, heading and quote marks at the start.
// Escaping more, like every hyphen in "PROJ-42", risks Teams showing the backslashes.
function escapeMarkdown(text: string): string {
	return text
		.replaceAll(/[\\`*_[\]]/g, character => `\\${character}`)
		.replace(/^[#>+-]/, '\\$&')
		.replace(/^(\d+)\./, '$1\\.')
}
