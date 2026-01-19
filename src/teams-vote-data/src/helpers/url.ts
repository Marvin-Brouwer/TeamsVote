
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
    if (typeof keyOrUrl === 'string') return keyOrUrl;

    const [titleKey, keyUrl] = keyOrUrl
    if(!titleKey) return `[${keyUrl}](${keyUrl})`

    return `[${titleKey}](${keyUrl})`

}

export function formatUrlPlain(key: string) {
    const keyOrUrl = parseKeyUrl(key)
    if (typeof keyOrUrl === 'string') return `"${keyOrUrl}"`;

    const [titleKey, url] = keyOrUrl
    if(!titleKey) return url.href;

    return titleKey;
}

function parseUrl(value: string): URL | string {
    try {
        return new URL(value)
    } catch {
        return value
    }
}