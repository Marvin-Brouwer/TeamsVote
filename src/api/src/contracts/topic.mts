/**
 * Atlassian cloud hosts, followed by a direct issue link or a board link with `selectedIssue`.
 * Host list: https://support.atlassian.com/organization-administration/docs/ip-addresses-and-domains-for-atlassian-cloud-products/
 */
const jiraIssuePattern = /(\.atl-paas\.net|\.atlassian\.com|\.ss-inf\.net|\.atlassian\.net|\.jira\.com)(\/browse\/|.*selectedIssue=)(?<issueKey>[A-Z]+-\d+)/is

/** The thing being estimated: either plain text, or a link with a short label to show for it. */
export type Topic =
	| { readonly kind: 'text'; readonly text: string }
	| { readonly kind: 'link'; readonly url: string; readonly label: string; readonly issueKey?: string }

export const maxTopicLength = 300

export function parseTopic(input: string): Topic {
	const text = input.trim()
	const url = tryParseUrl(text)
	if (!url) return { kind: 'text', text }

	const issueKey = jiraIssuePattern.exec(text)?.groups?.issueKey
	if (issueKey) return { kind: 'link', url: url.href, label: issueKey, issueKey }

	return { kind: 'link', url: url.href, label: `${url.host}${url.pathname === '/' ? '' : '/…'}` }
}

/** Short, plain-text name for a topic. Used for dialog titles and the like. */
export function topicTitle(topic: Topic): string {
	return topic.kind === 'text' ? topic.text : topic.label
}

function tryParseUrl(value: string): URL | undefined {
	if (!/^https?:\/\//i.test(value)) return undefined
	try {
		return new URL(value)
	} catch {
		return undefined
	}
}
