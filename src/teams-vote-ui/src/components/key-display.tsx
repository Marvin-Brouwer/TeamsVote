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
			if (!url) return <h2>{session.roundKey}</h2>
			return <h2>
				<a href={url} target="_blank">
					{title}
				</a>
			</h2>
		}}</>
	</Show>
}