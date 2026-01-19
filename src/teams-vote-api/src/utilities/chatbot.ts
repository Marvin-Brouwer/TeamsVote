import { TeamsActivityHandler, TurnContext } from 'botbuilder';

export class ChatBot extends TeamsActivityHandler {
    constructor() {
        super();

        // Handle messages
        this.onMessage(async (context, next) => {
            const text = context.activity.text?.trim().toLowerCase() || "";
            if (text.trim().startsWith('/vote')) {
                await this.triggerHelpResponse(context);
                return await next();
            }
            if (!text.trimEnd().startsWith('/vote ')) return await next();

            // TODO maybe use commandr?
            const command = text.trim().replace('/vote ', '')
            if (command.length < 2) {
                await this.triggerHelpResponse(context);
                return await next();
            }

            const [arg0, ...args] = command.split(' ');
            const type = arg0.startsWith('--') ? arg0.substring(2) : 'modified-fibonacci';
            const name = arg0.startsWith('--') ? args.join(' ') : command

            await this.triggerModal(context, type, name);
            await next();
        });
    }

    private async triggerHelpResponse(context: TurnContext) {

        await context.sendActivity(`TODO! You said: "${context.activity.text}", this will trigger a help response later`);
    }

    private async triggerModal(context: TurnContext, type: string, name: string) {

        // Trigger Task Module
        await context.sendActivity({
            type: "invokeResponse",
            value: {
                status: 200,
                body: {
                    task: {
                        type: "continue",
                        value: {
                            title: "Vote Modal",
                            url: "https://example.com/vote-modal",
                            height: 400,
                            width: 600
                        }
                    }
                }
            }
        });
    }
}