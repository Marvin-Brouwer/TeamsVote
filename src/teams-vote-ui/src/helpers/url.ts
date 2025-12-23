
const jiraRegex = new RegExp(
    // All Jira urls: https://support.atlassian.com/organization-administration/docs/ip-addresses-and-domains-for-atlassian-cloud-products/
    "(\.atl-paas\.net|\.atlassian\.com|\.ss-inf\.net|\.atlassian\.net|\.jira\.com)"+
    // Via direct or board link
    "(\/browse\/|.*selectedIssue=)(?<jiraKey>[A-Z]+\-[0-9]+)",
    // Single line case-insensitive
    "is"
)

export function parseKeyUrl(key: string) {
    const urlOrString = parseUrl(key);
    if (typeof urlOrString === 'string') return key
    const jiraMatch = jiraRegex.exec(key)
    if (jiraMatch && jiraMatch.groups?.jiraKey) return [jiraMatch.groups?.jiraKey, key]

    return [key, key]
}

export function formatUrl(key: string) {
    const keyOrUrl = parseKeyUrl(key)
    if (keyOrUrl.length === 1) return key;

    const [titleKey, keyUrl] = keyOrUrl
    return`[${titleKey}](${keyUrl})`

}

function parseUrl(value: string): URL | string {
    try {
        return new URL(value)
    } catch {
        return value
    }
}