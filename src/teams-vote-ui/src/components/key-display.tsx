import { Component } from "solid-js";
import { parseKeyUrl } from "../helpers/url";

export const KeyDisplay: Component<{ key: string }> = ({ key }) => {
    
        const keyOrUrl = parseKeyUrl(key)
        if (keyOrUrl.length === 1) return key;
    
        const [titleKey, keyUrl] = keyOrUrl
        return <a href={keyUrl} target="_blank">{titleKey}</a>
}