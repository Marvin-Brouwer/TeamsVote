import { formatUrl, formatUrlForTitle } from "../_module";


function createSummaryCard(roundKey: string, score: string | number | undefined) {

    return adaptiveCard(
        {
            "type": "TextBlock",
            "text": "Teams Vote",
            "wrap": true,
            "style": "heading",
            "size": "Large"
        },
        {
            "type": "TextBlock",
            "text": `Vote on ${formatUrl(roundKey)}`,
            "wrap": true,
            "separator": true
        },
        {
            "type": "TextBlock",
            "text": `Average score: **${score}**`,
            "wrap": true,
            "spacing": "None"
        },
        // TODO Make copy work via chatbot
        {
            "type": "ActionSet",
            "actions": [
                {
                    "type": "Action.Submit",
                    "title": "Copy",
                    "data": {
                        "copyValue": score
                    },
                    "iconUrl": "icon:Copy"
                }
            ]
        }
    )
}

function createJoinCard(pageUrl: string, roundKey: string, teamsAppId: string) {

    const deepLink = new URL(`https://teams.microsoft.com/l/task/${teamsAppId}`) 
    deepLink.searchParams.append('url', encodeURIComponent(pageUrl))
    deepLink.searchParams.append('height', encodeURIComponent('large'))
    deepLink.searchParams.append('width', encodeURIComponent('medium'))
    deepLink.searchParams.append('title', `TeamsVote ${formatUrlForTitle(roundKey)}`)

    return adaptiveCard(
        {
            "type": "TextBlock",
            "text": "Teams Vote",
            "wrap": true,
            "style": "heading",
            "size": "Large"
        },
        {
            "type": "TextBlock",
            "text": `Vote on ${formatUrl(roundKey)}`,
            "wrap": true,
            "separator": true
        },
        {
            "type": "ActionSet",
            "actions": [
                {
                    "type": "Action.OpenUrl",
                    "title": "Vote",
                    "iconUrl": "icon:Vote",
                    "url": deepLink,
                    "style": "positive"
                }
            ]
        }
    )
}

export const cardBuilder = {
    createSummaryCard,
    createJoinCard
}

function adaptiveCard(...body: object[]) {
    return {
        "type": "AdaptiveCard",
        "$schema": "https://adaptivecards.io/schemas/adaptive-card.json",
        "version": "1.5",
        "body": body
    }
}