import { Component, Show } from "solid-js";
import { parseKeyUrl } from "../helpers/url";
import { useSession } from "../contexts/session-context";

export const KeyDisplay: Component = () => {


	const { session } = useSession();
	return <Show when={session.roundKey} fallback={<h2>Loading</h2>}>
		<>{() => {
			const keyOrUrl = parseKeyUrl(session.roundKey!);
			if (typeof keyOrUrl === 'string') return <h2>{session.roundKey}</h2>
			const [title, url] = keyOrUrl
			if (!title) return <h2>{session.roundKey}</h2>
			return <h2>
				<a href={url.href} target="_blank">
					{title}
				</a>
				<TitleDisplay url={url} key={title} />
			</h2>
		}}</>
	</Show>
}
export const TitleDisplay: Component<{ url: URL, key: string }> = () => {

	// createEffect(async () => {
	// 	console.log(await requestJiraSummary(url, key, undefined!))
	// })

	return undefined
}

// TODO: Proxy through backend using OATH
// For best UX, only the admin should have to be logged in, and it should be a choice
async function requestJiraSummary(baseUrl: URL, issueKey: string, signal: AbortSignal) {
    const response = await fetch(new URL(`/rest/api/3/issue/${issueKey}?fields=summary`, baseUrl), {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal
    }).then(httpResponse => {
        return [httpResponse.json(), httpResponse.ok];
    });

    return response
}