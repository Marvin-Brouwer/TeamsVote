import { TeamsActivityHandler, TurnContext, CardFactory } from "botbuilder";

export class VoteBot extends TeamsActivityHandler {
  constructor() {
    super();
    this.onMessage(async (context, next) => {
      const text = context.activity.text?.trim().toLowerCase();
      if (text === "/vote") {
        const card = {
          type: "AdaptiveCard",
          body: [{ type: "TextBlock", text: "Test popup for poster" }],
          actions: [
            {
              type: "Action.OpenUrl",
              title: "Open Vote",
              url: "http://localhost:5173/"
            }
          ],
          $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
          version: "1.4"
        };
        await context.sendActivity({ attachments: [CardFactory.adaptiveCard(card)] });
      }
      await next();
    });
  }
}
