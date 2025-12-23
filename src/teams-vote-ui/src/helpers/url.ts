
const jiraRegex = new RegExp(
    // All Jira urls: https://support.atlassian.com/organization-administration/docs/ip-addresses-and-domains-for-atlassian-cloud-products/
    "(\.atl-paas\.net|\.atlassian\.com|\.ss-inf\.net|\.atlassian\.net|\.jira\.com)"+
    // Via direct or board link
    "(\/browse\/|.*selectedIssue=)(?<jiraKey>[A-Z]+\-[0-9]+)",
    // Single line case-insensitive
    "is"
)

export function parseKeyUrl(key: string): string | [undefined, URL] | [string,URL] {
    const urlOrString = parseUrl(key);
    if (typeof urlOrString === 'string') return key
    const jiraMatch = jiraRegex.exec(key)
    if (jiraMatch && jiraMatch.groups?.jiraKey) return [jiraMatch.groups?.jiraKey, urlOrString]

    return [undefined, urlOrString]
}

export function formatUrl(key: string) {
    const keyOrUrl = parseKeyUrl(key)
    if (keyOrUrl.length === 1) return key;

    const [titleKey, keyUrl] = keyOrUrl
    if(!titleKey) return `[${key}](${key})`

    return`[${titleKey}](${keyUrl})`

}

function parseUrl(value: string): URL | string {
    try {
        return new URL(value)
    } catch {
        return value
    }
}