async function postCard(chatId: string, accessToken: string, cardPayload: any) {
    const response = await fetch(`https://graph.microsoft.com/v1.0/chats/${chatId}/messages`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(cardPayload),
    });

    if (!response.ok) {
        throw new Error(`Failed to post card: ${await response.text()}`);
    }
}

export const teamsMessages = {
    postCard
}