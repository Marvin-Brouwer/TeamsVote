import { parseDeckId, type DeckId } from '../contracts/decks.mts'
import { maxTopicLength } from '../contracts/topic.mts'

export type MentionCommand =
	| { readonly kind: 'help'; readonly problem?: string }
	| { readonly kind: 'start'; readonly topic: string; readonly deck: DeckId }

const deckFlag = /(?:^|\s)--(\S+)/

/**
 * Reads what someone typed after mentioning the bot, with the mention already stripped.
 * `PROJ-123 --t-shirt` starts a vote; `help`, nothing, or something unreadable gets the help card.
 */
export function parseMentionCommand(text: string): MentionCommand {
	const trimmed = text.trim()
	if (trimmed === '' || /^\/?help$/i.test(trimmed)) return { kind: 'help' }

	const flag = deckFlag.exec(trimmed)
	const deck = parseDeckId(flag?.[1])
	if (!deck) return { kind: 'help', problem: `I don't know the deck "${flag?.[1]}".` }

	const topic = trimmed.replace(deckFlag, ' ').trim()
	if (topic === '') return { kind: 'help', problem: 'Tell me what to estimate.' }
	if (topic.length > maxTopicLength) return { kind: 'help', problem: `Keep it under ${maxTopicLength} characters.` }

	return { kind: 'start', topic, deck }
}
